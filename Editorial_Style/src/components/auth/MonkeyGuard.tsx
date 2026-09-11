import monkeyEyesClosed from "@/assets/monkey-eyes-closed.png";
import monkeyHoodie from "@/assets/monkey-hoodie.png";
import monkeyLookDown from "@/assets/monkey-look-down.png";

type Props = {
  /** Monkey closes both eyes while the password field is active. */
  covering: boolean;
  /** Monkey watches while the user fills another field. */
  watching?: boolean;
  /** Monkey looks toward the field below. */
  lookDown?: boolean;
  className?: string;
};

export function MonkeyGuard({ covering, watching = false, lookDown = false, className }: Props) {
  const image = covering ? monkeyEyesClosed : lookDown ? monkeyLookDown : monkeyHoodie;

  return (
    <div
      className={`${className ?? ""} relative overflow-hidden rounded-full bg-secondary shadow-sm ring-1 ring-border transition-transform duration-300 ease-out ${
        watching ? "scale-[1.02]" : "scale-100"
      }`}
      aria-hidden="true"
    >
      <img
        src={image}
        alt=""
        draggable={false}
        className={`absolute inset-0 h-full w-full select-none object-cover transition-all duration-300 ease-out ${
          lookDown ? "translate-y-1" : "translate-y-0"
        }`}
      />
    </div>
  );
}
