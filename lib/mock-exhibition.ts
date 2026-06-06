import type { Exhibition, GenerateRequest, Mode } from "./types";
import { DEFAULT_LANGUAGE } from "./constants";

/**
 * Mock exhibition generator.
 *
 * Produces deterministic, schema-valid content (see docs/prompt_spec.md §3)
 * without calling any real LLM. The output varies by mode so the four
 * curatorial lenses feel distinct. When the LLM is wired up later, this
 * module can be swapped for a real provider call behind the same signature.
 */

/** Turn "Dép tổ ong" into "dép tổ ong" for mid-sentence use. */
function lower(name: string): string {
  return name.charAt(0).toLowerCase() + name.slice(1);
}

/** Turn "dép tổ ong" into "Dép tổ ong" for headings. */
function cap(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** ASCII-ish, no-diacritic-ish hashtag fragment from an object name. */
function slugTag(name: string): string {
  const map: Record<string, string> = {
    à: "a", á: "a", ả: "a", ã: "a", ạ: "a",
    ă: "a", ằ: "a", ắ: "a", ẳ: "a", ẵ: "a", ặ: "a",
    â: "a", ầ: "a", ấ: "a", ẩ: "a", ẫ: "a", ậ: "a",
    è: "e", é: "e", ẻ: "e", ẽ: "e", ẹ: "e",
    ê: "e", ề: "e", ế: "e", ể: "e", ễ: "e", ệ: "e",
    ì: "i", í: "i", ỉ: "i", ĩ: "i", ị: "i",
    ò: "o", ó: "o", ỏ: "o", õ: "o", ọ: "o",
    ô: "o", ồ: "o", ố: "o", ổ: "o", ỗ: "o", ộ: "o",
    ơ: "o", ờ: "o", ớ: "o", ở: "o", ỡ: "o", ợ: "o",
    ù: "u", ú: "u", ủ: "u", ũ: "u", ụ: "u",
    ư: "u", ừ: "u", ứ: "u", ử: "u", ữ: "u", ự: "u",
    ỳ: "y", ý: "y", ỷ: "y", ỹ: "y", ỵ: "y",
    đ: "d",
  };
  return name
    .toLowerCase()
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^(.)/, (m) => m.toUpperCase());
}

type Template = Omit<
  Exhibition,
  "id" | "object_name" | "mode" | "language" | "created_at"
>;

function buildTemplate(name: string, mode: Mode): Template {
  const lo = lower(name);
  const Cap = cap(name);
  const tag = slugTag(name);

  const sharedFacts = [
    `${Cap} quen thuộc đến mức nhiều người không nhớ lần đầu mình thấy nó là khi nào.`,
    `Thiết kế của ${lo} gần như không cần hướng dẫn: nhìn là biết dùng, hỏng là biết thay.`,
    `Giá rẻ và dễ tìm khiến ${lo} xuất hiện ở rất nhiều không gian khác nhau trong đời sống.`,
  ];

  switch (mode) {
    case "Vietnamese Culture":
      return {
        title: `Bảo tàng một phút: ${Cap}`,
        hook: `Nếu có một vật vừa bình dân, vừa bền bỉ, vừa gắn với ký ức nhiều thế hệ, đó có lẽ là ${lo}.`,
        what_it_is: `${Cap} là một vật dụng đời thường, gần gũi và thường xuất hiện trong sinh hoạt hằng ngày của người Việt.`,
        origin_or_context: `Trong đời sống Việt Nam, ${lo} thường được gắn với sự thực dụng: rẻ, bền, dễ thay và phù hợp với nhiều không gian như nhà, quán xá, ký túc xá hay góc phố.`,
        three_fun_facts: sharedFacts,
        design_or_cultural_insight: `${Cap} cho thấy một thứ bình thường vẫn có thể chứa đầy ký ức tập thể. Giá trị của nó nằm ở chỗ nó đi cùng những thói quen thật của người dùng.`,
        why_it_matters: `Nó đáng chú ý vì là một vật nhỏ nhưng chứa nhiều câu chuyện về đời sống bình dân, sự tiện dụng và ký ức chung của nhiều người.`,
        reflection_question: `Nếu phải đặt ${lo} vào bảo tàng, bạn sẽ đặt nó cạnh hiện vật nào?`,
        share_quote: `Một vật bình dân nhưng sống dai trong ký ức Việt Nam.`,
        hashtags: ["BaoTang1Phut", "OneMinuteMuseum", "DoiSongVietNam"],
      };

    case "Museum":
      return {
        title: `Hiện vật: ${Cap}`,
        hook: `Hãy nhìn ${lo} như một hiện vật được trưng bày — bình thường, nhưng đáng để dừng lại một phút.`,
        what_it_is: `${Cap} là một vật dụng phổ biến, được chọn vào bộ sưu tập này như một ví dụ về đồ vật đời thường.`,
        origin_or_context: `Được xem là một phần quen thuộc của đời sống thường nhật, ${lo} thường xuất hiện trong nhiều bối cảnh khác nhau mà ít khi được chú ý tới.`,
        three_fun_facts: sharedFacts,
        design_or_cultural_insight: `Đặt trong không gian bảo tàng, ${lo} nhắc rằng những vật tưởng như tầm thường cũng mang dấu vết của thói quen, vật liệu và thời đại tạo ra chúng.`,
        why_it_matters: `Nó đáng chú ý vì giúp ta thực hành cách nhìn chậm lại: quan sát một vật quen thuộc như thể lần đầu nhìn thấy.`,
        reflection_question: `Nếu ${lo} có một tấm bảng mô tả trong bảo tàng, bạn muốn dòng đầu tiên viết gì?`,
        share_quote: `Một vật đời thường, nhìn chậm lại bỗng thành hiện vật.`,
        hashtags: ["BaoTang1Phut", "OneMinuteMuseum", "MuseumLabel"],
      };

    case "Fun Fact":
      return {
        title: `Bạn có biết: ${Cap}`,
        hook: `${Cap} trông thì bình thường, nhưng đứng yên nhìn kỹ một chút là thấy vài điều khá vui.`,
        what_it_is: `${Cap} là một vật quen mặt tới mức ta gần như quên luôn là nó ở đó.`,
        origin_or_context: `Không ai dựng tượng đài cho ${lo}, nhưng nó vẫn âm thầm có mặt trong vô số khoảnh khắc đời thường.`,
        three_fun_facts: sharedFacts,
        design_or_cultural_insight: `Điều vui là ${lo} gần như "tàng hình" vì quá quen — và những thứ quen nhất lại thường giấu nhiều chuyện thú vị nhất.`,
        why_it_matters: `Nó đáng chú ý vì nhắc ta rằng niềm vui nhỏ có thể trốn trong những vật bình thường nhất quanh mình.`,
        reflection_question: `Lần gần nhất bạn thật sự để ý tới ${lo} là khi nào?`,
        share_quote: `Vật bình thường nhất nhà, hóa ra cũng có chuyện để kể.`,
        hashtags: ["BaoTang1Phut", "FunFact", "DoVatHangNgay"],
      };

    case "Design":
      return {
        title: `Phân tích thiết kế: ${Cap}`,
        hook: `Nhìn ${lo} dưới góc một sản phẩm: nó giải quyết vấn đề gì, và đánh đổi những gì để làm được điều đó?`,
        what_it_is: `${Cap} là một sản phẩm đời thường với hình dáng, vật liệu và cách dùng được tối ưu cho sự tiện lợi.`,
        origin_or_context: `Là một thiết kế phổ thông, ${lo} thường ưu tiên chi phí thấp, độ bền và khả năng sản xuất hàng loạt hơn là vẻ sang trọng.`,
        three_fun_facts: sharedFacts,
        design_or_cultural_insight: `Về mặt thiết kế, ${lo} cho thấy một sản phẩm tốt không nhất thiết phải đẹp đắt tiền: đôi khi giá trị nằm ở rẻ, bền, dễ làm và khớp với hành vi thật của người dùng.`,
        why_it_matters: `Nó đáng chú ý vì là bài học về trade-off: mỗi lựa chọn vật liệu hay hình dáng đều đổi một thứ này để lấy một thứ khác.`,
        reflection_question: `Nếu được thiết kế lại ${lo}, bạn sẽ giữ điều gì và thay đổi điều gì đầu tiên?`,
        share_quote: `Thiết kế tốt không cần sang — chỉ cần khớp với đời thật.`,
        hashtags: ["BaoTang1Phut", "DesignThinking", "EverydayDesign"],
      };
  }
}

/** Generate a full mock Exhibition for the given request. */
export function generateMockExhibition(req: GenerateRequest): Exhibition {
  const name = req.object_name.trim();
  const template = buildTemplate(name, req.mode);

  return {
    id: crypto.randomUUID(),
    object_name: name,
    mode: req.mode,
    language: req.language ?? DEFAULT_LANGUAGE,
    created_at: new Date().toISOString(),
    ...template,
  };
}
