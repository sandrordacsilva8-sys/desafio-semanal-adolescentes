import { useState, useEffect } from 'react';
import { useAppStore } from '../store/AppStore';
import { BookOpen, X, Loader2, Link as LinkIcon, Book } from 'lucide-react';
import { LibraryBook } from '../types';
import { get } from 'idb-keyval';

function BookReader({ book, onClose }: { book: LibraryBook, onClose: () => void }) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let urlToRevoke: string | null = null;
    
    async function loadBook() {
      if (book.isPdf) {
        try {
          const file = await get(`pdf_${book.id}`) as File;
          if (file) {
            const url = URL.createObjectURL(file);
            urlToRevoke = url;
            setEmbedUrl(url);
          } else {
            setError('Arquivo PDF não encontrado.');
          }
        } catch (err) {
          setError('Erro ao carregar o arquivo PDF.');
        }
      } else if (book.url) {
        let finalUrl = book.url;
        if (finalUrl.includes('canva.com') && !finalUrl.includes('embed')) {
          try {
            const urlObj = new URL(finalUrl);
            urlObj.searchParams.set('embed', 'true');
            finalUrl = urlObj.toString();
          } catch(e) {}
        }
        setEmbedUrl(finalUrl);
      }
    }
    
    loadBook();

    return () => {
      if (urlToRevoke) {
        URL.revokeObjectURL(urlToRevoke);
      }
    };
  }, [book]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-in fade-in">
      <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-white text-base sm:text-lg">{book.title}</h2>
            <p className="text-[10px] sm:text-xs text-slate-400">Modo Leitura</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-2"
        >
          <X className="w-4 h-4" /> Fechar Leitor
        </button>
      </div>
      
      <div className="flex-1 relative bg-slate-950 flex flex-col">
        {error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-rose-400 p-6 text-center">
            <p className="font-bold">{error}</p>
          </div>
        ) : !embedUrl ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
            <p className="text-sm font-bold">Processando arquivo...</p>
          </div>
        ) : (
          <>
            {iframeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-950">
                <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
                <p className="text-sm font-bold">Carregando livro...</p>
              </div>
            )}
            <iframe 
              src={embedUrl}
              onLoad={() => setIframeLoading(false)}
              allowFullScreen
              allow="fullscreen"
              className="w-full h-full border-none relative z-10"
              style={{ display: iframeLoading ? 'none' : 'block' }}
            ></iframe>
          </>
        )}
      </div>
    </div>
  );
}

export function LibraryView() {
  const { books } = useAppStore();
  const [readingBook, setReadingBook] = useState<LibraryBook | null>(null);

  if (readingBook) {
    return <BookReader book={readingBook} onClose={() => setReadingBook(null)} />;
  }

  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Book className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-white text-xl">Biblioteca Digital</h2>
            <p className="text-sm text-slate-400 mt-1">Livros e materiais recomendados pela liderança</p>
          </div>
        </div>
      </div>

      {books && books.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map(book => (
            <div key={book.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:bg-slate-800 hover:border-slate-700 transition group flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base mb-2 line-clamp-2">{book.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">Material disponível para leitura online.</p>
              </div>
              <button 
                onClick={() => {
                  setReadingBook(book);
                }}
                className="mt-6 w-full py-2.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white font-bold text-xs rounded-xl transition-all"
              >
                Ler Agora
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
          <Book className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-400">Nenhum livro disponível</h3>
          <p className="text-sm text-slate-500 mt-1">A liderança ainda não adicionou materiais na biblioteca.</p>
        </div>
      )}
    </section>
  );
}
