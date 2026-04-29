import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, ZoomInIcon, ZoomOutIcon, DownloadIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

export interface ImageViewerProps {
  url: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export function ImageViewer({ 
  url, 
  alt, 
  isOpen, 
  onClose, 
  onDownload,
  onNext,
  onPrev,
  hasNext,
  hasPrev
}: ImageViewerProps) {
  const [scale, setScale] = React.useState(1);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleReset = () => setScale(1);

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && hasNext && onNext) {
        onNext();
        setScale(1); // Reset zoom on navigation
      } else if (e.key === 'ArrowLeft' && hasPrev && onPrev) {
        onPrev();
        setScale(1); // Reset zoom on navigation
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, hasNext, hasPrev, onNext, onPrev, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
                title="Zoom out"
              >
                <ZoomOutIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleZoomIn}
                className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
                title="Zoom in"
              >
                <ZoomInIcon className="w-5 h-5" />
              </button>
              <span className="text-white text-sm ml-2">{Math.round(scale * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              {onDownload && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload();
                  }}
                  className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
                  title="Download"
                >
                  <DownloadIcon className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
                title="Close"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Buttons */}
          {hasPrev && onPrev && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
                setScale(1);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-20"
              title="Previous"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
          )}
          {hasNext && onNext && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
                setScale(1);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-20"
              title="Next"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          )}

          {/* Image */}
          <motion.img
            key={url} // Force re-render on url change
            src={url}
            alt={alt || 'Image'}
            className="max-w-full max-h-full object-contain cursor-grab active:cursor-grabbing"
            style={{ transform: `scale(${scale})` }}
            onClick={(e) => e.stopPropagation()}
            drag={scale > 1}
            dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
            onDoubleClick={handleReset}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
