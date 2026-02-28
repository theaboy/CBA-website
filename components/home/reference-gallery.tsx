import Image from "next/image";

const references = [
  { src: "/cba/home-reference.png", label: "Homepage direction" },
  { src: "/cba/gigs-reference.png", label: "Event rhythm" },
  { src: "/cba/mixes-reference.png", label: "Releases and audio mood" },
  { src: "/cba/press-kit-reference.png", label: "Press kit visual cues" }
];

export function ReferenceGallery() {
  return (
    <div className="reference-grid">
      {references.map((item) => (
        <figure key={item.src} className="reference-card">
          <Image src={item.src} alt={item.label} width={1200} height={800} />
          <figcaption>{item.label}</figcaption>
        </figure>
      ))}
    </div>
  );
}
