export default function AdSlot({ id }: { id: string }) {
  return (
    <div
      data-ad-slot={id}
      className="my-8 flex min-h-[250px] items-center justify-center rounded border border-dashed text-xs text-neutral-400"
    >
      Khu vực quảng cáo
    </div>
  );
}
