import { describe, expect, it } from "vitest";
import { renderBody } from "../../src/lib/format-text";

describe("renderBody", () => {
  it("escapes HTML so case-study text can never inject markup", () => {
    expect(renderBody('<script>alert("x")</script> & co')).toBe(
      '<p>&lt;script&gt;alert("x")&lt;/script&gt; &amp; co</p>',
    );
  });

  it("renders inline code, bold and italic (bold before italic)", () => {
    expect(renderBody("Use `polars` for **speed** and *clarity*")).toBe(
      "<p>Use <code>polars</code> for <strong>speed</strong> and <em>clarity</em></p>",
    );
  });

  it("splits paragraphs on blank lines and joins wrapped lines", () => {
    expect(renderBody("First line\ncontinues\n\nSecond")).toBe("<p>First line continues</p><p>Second</p>");
  });

  it("renders bullet and numbered lists", () => {
    expect(renderBody("- one\n- **two**")).toBe("<ul><li>one</li><li><strong>two</strong></li></ul>");
    expect(renderBody("1. first\n2. second")).toBe("<ol><li>first</li><li>second</li></ol>");
  });

  it("keeps a block as a paragraph when only some lines look like list items", () => {
    expect(renderBody("Intro\n- not a list")).toBe("<p>Intro - not a list</p>");
  });
});
