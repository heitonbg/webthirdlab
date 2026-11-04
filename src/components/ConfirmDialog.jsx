import { useEffect, useId, useRef } from 'react';

export function ConfirmDialog({ title, children, onConfirm, onClose }) {
  const ref = useRef(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return <dialog ref={ref} aria-labelledby={id} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === ref.current) onClose(); }}>
    <div className="dialog-content"><p className="eyebrow">Подтверждение</p><h2 id={id}>{title}</h2><div>{children}</div>
      <div className="actions"><button type="button" autoFocus onClick={onClose}>Отмена</button><button type="button" className="danger" onClick={onConfirm}>Удалить</button></div>
    </div>
  </dialog>;
}
