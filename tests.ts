import { load } from "./mod.ts";
import { assertEquals } from "https://deno.land/std@0.173.0/testing/asserts.ts";

Deno.test("dQuery", async (t) => {
  const $ = load(`
    <html>
      <body>
        <div>
          <p class="bar">Hello World</p>
          <p class="bar">Goodbye World</p>
        </div>
        <h1 id="foo">This is <b>bold</b></h1>
      </body>
    </html>
  `);

  const el = $("#foo")!;

  await t.step("text", () => {
    assertEquals(el.text, "This is bold");
  });

  await t.step("html", () => {
    assertEquals(el.html, "This is <b>bold</b>");
  });

  await t.step("attr", () => {
    assertEquals(el.attr("id"), "foo");
  });

  await t.step("attr (missing)", () => {
    assertEquals(el.attr("missing"), null);
  });

  const list = $(".bar")!;

  await t.step("first", () => {
    assertEquals(list.first.text, "Hello World");
  });

  await t.step("last", () => {
    assertEquals(list.last.text, "Goodbye World");
  });

  await t.step("prop", () => {
    assertEquals(el.prop("tagName"), "H1");
  })

  await t.step("find" , ()=> {
    assertEquals(el.find("b").text, "bold");
  })
});
