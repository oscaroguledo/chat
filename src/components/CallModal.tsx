import React, { useEffect, useState } from 'react';
import {
  PhoneOffIcon,
  MicIcon,
  MicOffIcon,
  Volume2Icon,
  VolumeXIcon,
  VideoIcon,
  VideoOffIcon,
  CameraIcon,
  XIcon } from
'lucide-react';
import { motion } from 'framer-motion';
export type CallType = 'voice' | 'video';
interface CallModalProps {
  contactName: string;
  contactAvatar: string;
  callType: CallType;
  onClose: () => void;
}
export function CallModal({
  contactName,
  contactAvatar,
  callType,
  onClose
}: CallModalProps) {
  const [callState, setCallState] = useState<'ringing' | 'connected' | 'ended'>(
    'ringing'
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(callType === 'video');
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const connectTimer = setTimeout(() => setCallState('connected'), 3000);
    return () => clearTimeout(connectTimer);
  }, []);
  useEffect(() => {
    if (callState !== 'connected') return;
    const interval = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [callState]);
  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };
  const handleEndCall = () => {
    setCallState('ended');
    setTimeout(onClose, 800);
  };
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleEndCall();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);
  const ControlButton = ({
    active,
    activeIcon,
    inactiveIcon,
    label,
    onClick,
    danger







  }: {active: boolean;activeIcon: React.ReactNode;inactiveIcon: React.ReactNode;label: string;onClick: () => void;danger?: boolean;}) =>
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 ${danger ? '' : ''}`}>
    
      <div
      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${danger ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30' : active ? 'bg-white/25 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
      
        {active ? activeIcon : inactiveIcon}
      </div>
      <span className="text-[10px] text-white/50 font-medium">{label}</span>
    </button>;

  return (
    <motion.div
      initial={{
        opacity: 0
      }}
      animate={{
        opacity: 1
      }}
      exit={{
        opacity: 0
      }}
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={handleEndCall}>
      
      <motion.div
        initial={{
          scale: 0.9,
          opacity: 0
        }}
        animate={{
          scale: 1,
          opacity: 1
        }}
        exit={{
          scale: 0.9,
          opacity: 0
        }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
        
        {/* Close */}
        <div className="flex justify-end p-3">
          <button
            onClick={handleEndCall}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/50">
            
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Contact */}
        <div className="flex flex-col items-center px-6 pb-8">
          <div className="relative mb-5">
            {/* Video preview placeholder */}
            {isCameraOn && callState === 'connected' ?
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center border-4 border-white/10 overflow-hidden">
                <div className="text-center">
                  <VideoIcon className="w-8 h-8 text-white/40 mx-auto mb-1" />
                  <span className="text-[10px] text-white/30">Camera On</span>
                </div>
              </div> :

            <img
              src={contactAvatar}
              alt={contactName}
              className="w-28 h-28 rounded-full border-4 border-white/10" />

            }
            {callState === 'ringing' &&
            <motion.div
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 0, 0.4]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity
              }}
              className="absolute inset-0 rounded-full border-4 border-chat-accent" />

            }
            {callState === 'connected' &&
            <span className="absolute bottom-1 right-1 w-5 h-5 bg-chat-online rounded-full border-3 border-slate-800" />
            }
          </div>

          <h3 className="text-white text-xl font-semibold mb-1">
            {contactName}
          </h3>
          <p className="text-white/50 text-sm mb-1">
            {callType === 'video' ? 'Video Call' : 'Voice Call'}
          </p>
          <div className="h-5">
            {callState === 'ringing' &&
            <motion.p
              animate={{
                opacity: [1, 0.4, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity
              }}
              className="text-chat-accent text-sm font-medium">
              
                Ringing...
              </motion.p>
            }
            {callState === 'connected' &&
            <p className="text-chat-online text-sm font-medium">
                {formatElapsed(elapsed)}
              </p>
            }
            {callState === 'ended' &&
            <p className="text-white/40 text-sm">Call ended</p>
            }
          </div>
        </div>

        {/* Controls */}
        {callState !== 'ended' &&
        <div className="px-6 pb-8">
            <div className="flex items-start justify-center gap-5">
              <ControlButton
              active={isMuted}
              activeIcon={<MicOffIcon className="w-6 h-6" />}
              inactiveIcon={<MicIcon className="w-6 h-6" />}
              label={isMuted ? 'Unmute' : 'Mute'}
              onClick={() => setIsMuted(!isMuted)} />
            

              {callType === 'video' &&
            <ControlButton
              active={!isCameraOn}
              activeIcon={<VideoOffIcon className="w-6 h-6" />}
              inactiveIcon={<VideoIcon className="w-6 h-6" />}
              label={isCameraOn ? 'Cam Off' : 'Cam On'}
              onClick={() => setIsCameraOn(!isCameraOn)} />

            }

              <ControlButton
              active={false}
              activeIcon={<PhoneOffIcon className="w-7 h-7" />}
              inactiveIcon={<PhoneOffIcon className="w-7 h-7" />}
              label="End"
              onClick={handleEndCall}
              danger />
            

              <ControlButton
              active={isSpeaker}
              activeIcon={<Volume2Icon className="w-6 h-6" />}
              inactiveIcon={<VolumeXIcon className="w-6 h-6" />}
              label={isSpeaker ? 'Speaker' : 'Earpiece'}
              onClick={() => setIsSpeaker(!isSpeaker)} />
            

              {callType === 'video' &&
            <ControlButton
              active={isFrontCamera}
              activeIcon={<CameraIcon className="w-6 h-6" />}
              inactiveIcon={<CameraIcon className="w-6 h-6" />}
              label={isFrontCamera ? 'Front' : 'Back'}
              onClick={() => setIsFrontCamera(!isFrontCamera)} />

            }
            </div>
          </div>
        }
      </motion.div>
    </motion.div>);

}