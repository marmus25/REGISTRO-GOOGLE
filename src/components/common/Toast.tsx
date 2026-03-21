// src/components/common/Toast.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

export function Toast() {
  const toast = useAppStore(s => s.toast);

  const colors = {
    ok:   { bg: 'var(--success-l)', border: 'var(--success)',  text: 'var(--success-bright)' },
    err:  { bg: 'var(--danger-l)',  border: 'var(--danger)',   text: 'var(--danger-bright)'  },
    info: { bg: 'var(--ser-bg)',    border: 'var(--ser-c)',    text: 'var(--ser-c)'           },
  };

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: 12,
            fontFamily: 'var(--font)',
            fontSize: 14,
            fontWeight: 700,
            background: colors[toast.type].bg,
            border: `1px solid ${colors[toast.type].border}`,
            color: colors[toast.type].text,
            boxShadow: 'var(--shadow-lg)',
            maxWidth: 320,
          }}
        >
          {toast.msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}