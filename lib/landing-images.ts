// AUTO-GENERATED from public/images/landing/credits.json by
// scripts/fetch-landing-images.mjs. All images are Public Domain / CC0 from
// Wikimedia Commons. Attribution is preserved here and shown on /gioi-thieu.

export interface LandingImage {
  slug: string;
  src: string;
  title: string;
  author: string;
  license: string;
  sourceUrl: string;
}

export const LANDING_IMAGES: LandingImage[] = [
  { slug: "kien-truc", src: "/images/landing/kien-truc.jpg", title: "Khuê Văn Các — Temple of Literature, Hanoi", author: "Daderot", license: "CC0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Constellation_of_Literature_pavilion_-_Temple_of_Literature,_Hanoi_-_DSC04693.JPG" },
  { slug: "di-san", src: "/images/landing/di-san.jpg", title: "HoangHaBronzeDrum", author: "VuThiAnh", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:HoangHaBronzeDrum.jpg" },
  { slug: "trang-phuc", src: "/images/landing/trang-phuc.jpg", title: "Vintage hairstyles for Hanoian ladies in the 1950s", author: "Musée Annam", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Vintage_hairstyles_for_Hanoian_ladies_in_the_1950s.jpg" },
  { slug: "nghe-thuat-dan-gian", src: "/images/landing/nghe-thuat-dan-gian.jpg", title: "Tranh Đông Hồ - Cá chép", author: "Unknown", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Tranh_%C4%90%C3%B4ng_H%E1%BB%93_-_C%C3%A1_ch%C3%A9p.jpg" },
  { slug: "hero-1", src: "/images/landing/hero-1.jpg", title: "Hué, 1932 – La Ville Impériale – Vue aérienne", author: "Unknown", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Hu%C3%A9,_1932_%E2%80%93_La_Ville_Imp%C3%A9riale_%E2%80%93_Vue_a%C3%A9rienne.jpg" },
  { slug: "hero-2", src: "/images/landing/hero-2.jpg", title: "Dong Son drums", author: "Lưu Ly", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Dong_Son_drums.jpg" },
  { slug: "hero-3", src: "/images/landing/hero-3.jpg", title: "Chùa cầu Hội An đêm rằm (36311686293)", author: "Nguyen Phu Duc", license: "CC0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Ch%C3%B9a_c%E1%BA%A7u_H%E1%BB%99i_An_%C4%91%C3%AAm_r%E1%BA%B1m_(36311686293).jpg" },
];

export function landingImage(slug: string): LandingImage | undefined {
  return LANDING_IMAGES.find((i) => i.slug === slug);
}
