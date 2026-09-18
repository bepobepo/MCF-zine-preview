"""Focused regression checks for the article Markdown list renderer."""
import unittest
from build_moows import markdown_blocks, inline_markdown


class MarkdownListsTest(unittest.TestCase):
    def test_nested_mixed_lists_and_return_to_parent(self):
        source = '- Parent\n    - Child\n        1. **Step**\n        2. Next\n    - Sibling\n- End'
        self.assertEqual(markdown_blocks(source), '<ul><li>Parent<ul><li>Child<ol><li><strong>Step</strong></li><li>Next</li></ol></li><li>Sibling</li></ul></li><li>End</li></ul>')

    def test_blank_lines_preserve_nesting(self):
        self.assertEqual(markdown_blocks('- Parent\n\n    - Child\n\n- End'), '<ul><li>Parent<ul><li>Child</li></ul></li><li>End</li></ul>')

    def test_list_type_switch_and_paragraph(self):
        self.assertEqual(markdown_blocks('Intro\n\n- Bullet\n1. Number\n\nAfter'), '<p>Intro</p><ul><li>Bullet</li></ul><ol><li>Number</li></ol><p>After</p>')

    def test_tabs_emphasis_and_html_escaping(self):
        self.assertEqual(markdown_blocks('1. Parent\n\t- *Child* <script>'), '<ol><li>Parent<ul><li><em>Child</em> &lt;script&gt;</li></ul></li></ol>')


class MarkdownLinksTest(unittest.TestCase):
    def test_formatted_label_and_query(self):
        self.assertEqual(inline_markdown('[**Read** *more*](https://example.com/?a=1&b=2)'), '<a href="https://example.com/?a=1&amp;b=2"><strong>Read</strong> <em>more</em></a>')

    def test_relative_anchor_email_and_parentheses(self):
        for url in ('../story/', '#section', 'mailto:editor@example.com', 'https://example.com/a_(b)'):
            self.assertEqual(inline_markdown(f'[Read]({url})'), f'<a href="{url}">Read</a>')

    def test_literal_code_and_unsafe_scheme(self):
        self.assertEqual(inline_markdown('`[Read](https://example.com)`'), '<code>[Read](https://example.com)</code>')
        self.assertNotIn('<a ', inline_markdown('[Read](javascript:alert(1))'))
        self.assertNotIn('<a ', inline_markdown('[Read](data:text/html,test)'))

    def test_list_link(self):
        self.assertEqual(markdown_blocks('- [Read](../story/)'), '<ul><li><a href="../story/">Read</a></li></ul>')


if __name__ == '__main__':
    unittest.main()
