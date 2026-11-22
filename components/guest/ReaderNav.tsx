import Link from "next/link";

type Props = {
  prev: number | null;
  next: number | null;
  storyHref: string;
};

export default function ReaderNav({ prev, next, storyHref }: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      {next ? (
        <Link
          href={`${storyHref}/chapter/${next}`}
          className="flex w-full max-w-sm items-center justify-center gap-2 rounded-full bg-green-500 px-6 py-3 text-lg font-bold text-white hover:bg-green-600"
        >
          TIẾP THEO →
        </Link>
      ) : (
        <p className="text-neutral-500">Bạn đã đọc đến chương mới nhất.</p>
      )}

      <div className="flex w-full items-center justify-between text-sm">
        {prev ? (
          <Link href={`${storyHref}/chapter/${prev}`} className="rounded border px-3 py-2 hover:bg-neutral-100">
            ← Chương {prev}
          </Link>
        ) : (
          <span />
        )}
        <Link href={storyHref} className="text-neutral-500 hover:underline">
          Mục lục
        </Link>
      </div>
    </div>
  );
}