export default function BookHUD({ spread, label, head }: { spread: number; label: string; head: string }) {
  const visible = spread >= 1
  return (
    <>
      <div className="hud-head" style={{ opacity: visible && head ? 1 : 0 }} aria-hidden="true">{head}</div>
      <div className="hud-folio" style={{ opacity: visible ? 1 : 0 }} aria-hidden="true">{label}</div>
    </>
  )
}
