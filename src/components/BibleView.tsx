import { useState, useEffect } from 'react';
import { Book, ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react';

interface BookType {
  abbrev: string;
  name: string;
  chapters: string[][];
}

let cachedBible: BookType[] | null = null;

export function BibleView() {
  const [bible, setBible] = useState<BookType[] | null>(cachedBible);
  const [loading, setLoading] = useState(!cachedBible);
  const [error, setError] = useState('');
  
  const [selectedBookIndex, setSelectedBookIndex] = useState(0);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);

  useEffect(() => {
    if (cachedBible) return;

    setLoading(true);
    fetch('https://raw.githubusercontent.com/thiagobodruk/bible/master/json/pt_nvi.json')
      .then(res => {
        if (!res.ok) throw new Error('Falha ao carregar Bíblia');
        return res.text();
      })
      .then(text => {
        // Strip BOM if present
        const clean = text.trim().replace(/^\uFEFF/, '');
        const data = JSON.parse(clean);
        cachedBible = data;
        setBible(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Ocorreu um erro ao carregar a Bíblia Digital. Verifique sua conexão.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-indigo-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-bold">Baixando Bíblia NVI...</p>
      </div>
    );
  }

  if (error || !bible) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-6 rounded-3xl text-center">
        <p className="font-bold">{error}</p>
      </div>
    );
  }

  const currentBook = bible[selectedBookIndex];
  const currentChapter = currentBook.chapters[selectedChapterIndex];

  const handlePrevChapter = () => {
    if (selectedChapterIndex > 0) {
      setSelectedChapterIndex(selectedChapterIndex - 1);
    } else if (selectedBookIndex > 0) {
      const prevBook = bible[selectedBookIndex - 1];
      setSelectedBookIndex(selectedBookIndex - 1);
      setSelectedChapterIndex(prevBook.chapters.length - 1);
    }
  };

  const handleNextChapter = () => {
    if (selectedChapterIndex < currentBook.chapters.length - 1) {
      setSelectedChapterIndex(selectedChapterIndex + 1);
    } else if (selectedBookIndex < bible.length - 1) {
      setSelectedBookIndex(selectedBookIndex + 1);
      setSelectedChapterIndex(0);
    }
  };

  const hasPrev = selectedBookIndex > 0 || selectedChapterIndex > 0;
  const hasNext = selectedBookIndex < bible.length - 1 || selectedChapterIndex < currentBook.chapters.length - 1;

  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl sticky top-20 z-30">
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Book className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-white text-lg">Bíblia Digital</h2>
              <p className="text-[10px] sm:text-xs text-slate-400">Nova Versão Internacional (NVI)</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select 
              value={selectedBookIndex} 
              onChange={e => {
                setSelectedBookIndex(Number(e.target.value));
                setSelectedChapterIndex(0);
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 flex-1 md:flex-none"
            >
              {bible.map((book, idx) => (
                <option key={book.abbrev} value={idx}>{book.name}</option>
              ))}
            </select>

            <select 
              value={selectedChapterIndex} 
              onChange={e => setSelectedChapterIndex(Number(e.target.value))}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 flex-1 md:flex-none"
            >
              {currentBook.chapters.map((_, idx) => (
                <option key={idx} value={idx}>Capítulo {idx + 1}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl max-w-4xl mx-auto">
        <h3 className="text-2xl sm:text-3xl font-black text-center text-white mb-8 border-b border-slate-800 pb-6">
          {currentBook.name} {selectedChapterIndex + 1}
        </h3>

        <div className="space-y-4 text-base sm:text-lg leading-relaxed text-slate-300 font-serif pb-8">
          {currentChapter.map((verse, idx) => (
            <p key={idx} className="flex gap-3 hover:bg-slate-800/30 p-2 -mx-2 rounded-xl transition">
              <sup className="text-indigo-400 font-bold font-sans mt-1 shrink-0">{idx + 1}</sup>
              <span>{verse}</span>
            </p>
          ))}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          <button 
            onClick={handlePrevChapter}
            disabled={!hasPrev}
            className="px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-slate-800 hover:bg-slate-700 text-white"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
          
          <button 
            onClick={handleNextChapter}
            disabled={!hasNext}
            className="px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            Próximo <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
