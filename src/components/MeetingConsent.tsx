import { Check, ShieldCheck } from 'lucide-react';

export default function MeetingConsent({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return <div className="modal-backdrop"><div className="modal consent-modal" role="dialog" aria-modal="true" aria-labelledby="meeting-consent-title"><div className="modal-head"><div><span className="section-kicker">antes de entrar</span><h2 id="meeting-consent-title"><ShieldCheck size={19} /> Consentimento da reunião</h2></div></div><p>Ao entrar, você confirma que o áudio da reunião poderá ser gravado e transcrito para gerar uma ata resumida com quem falou cada trecho.</p><p className="consent-note">A gravação não começa antes desta confirmação. Você pode sair a qualquer momento.</p><div className="modal-foot"><button className="button secondary" onClick={onCancel}>Cancelar</button><button className="button primary" onClick={onConfirm}><Check size={16} /> OK, entrar na reunião</button></div></div></div>;
}
