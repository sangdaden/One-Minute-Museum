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
  { slug: "di-san", src: "/images/landing/di-san.jpg", title: "HoangHaBronzeDrum", author: "VuThiAnh", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:HoangHaBronzeDrum.jpg" },
  { slug: "trang-phuc", src: "/images/landing/trang-phuc.jpg", title: "Vintage hairstyles for Hanoian ladies in the 1950s", author: "Musée Annam", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Vintage_hairstyles_for_Hanoian_ladies_in_the_1950s.jpg" },
  { slug: "nghe-thuat-dan-gian", src: "/images/landing/nghe-thuat-dan-gian.jpg", title: "Tranh Đông Hồ - Cá chép", author: "Unknown", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Tranh_%C4%90%C3%B4ng_H%E1%BB%93_-_C%C3%A1_ch%C3%A9p.jpg" },
  { slug: "am-thuc", src: "/images/landing/am-thuc.jpg", title: "Cà phê phin Việt Nam", author: "Andy Li", license: "CC0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Vietnamese_Hot_Drip_Coffee_-_The_Big_Bowl.jpg" },
  { slug: "di-lai", src: "/images/landing/di-lai.jpg", title: "Honda Super Cub 110", author: "TTTNIS", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Honda_Super_Cub_110.jpg" },
  { slug: "tuoi-tho", src: "/images/landing/tuoi-tho.jpg", title: "Tò he con rồng", author: "JosephCan87", license: "CC0", sourceUrl: "https://commons.wikimedia.org/wiki/File:T%C3%B2_he_con_r%E1%BB%93ng.jpg" },
  { slug: "hero-1", src: "/images/landing/hero-1.jpg", title: "Hué, 1932 – La Ville Impériale – Vue aérienne", author: "Unknown", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Hu%C3%A9,_1932_%E2%80%93_La_Ville_Imp%C3%A9riale_%E2%80%93_Vue_a%C3%A9rienne.jpg" },
  { slug: "hero-2", src: "/images/landing/hero-2.jpg", title: "Mặt trống đồng Đông Sơn — Ngọc Lũ", author: "Daderot", license: "CC0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Cover_of_Ngoc_Lu_jar,_from_about_2500_years_ago_-_Vietnam_National_Museum_of_Fine_Arts_-_Hanoi,_Vietnam_-_DSC04742.JPG" },
  { slug: "hero-3", src: "/images/landing/hero-3.jpg", title: "Chùa cầu Hội An đêm rằm (36311686293)", author: "Nguyen Phu Duc", license: "CC0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Ch%C3%B9a_c%E1%BA%A7u_H%E1%BB%99i_An_%C4%91%C3%AAm_r%E1%BA%B1m_(36311686293).jpg" },
];

export function landingImage(slug: string): LandingImage | undefined {
  return LANDING_IMAGES.find((i) => i.slug === slug);
}
