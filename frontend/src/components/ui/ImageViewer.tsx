import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, ZoomInIcon, ZoomOutIcon, DownloadIcon } from 'lucide-react';

export interface ImageViewerProps {
  url: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
}

export function ImageViewer({ url, alt, isOpen, onClose, onDownload }: ImageViewerProps) {
  const [scale, setScale] = React.useState(1);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleReset = () => setScale(1);

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

          {/* Image */}
          <motion.img
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
