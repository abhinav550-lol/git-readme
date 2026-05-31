import MarkdownPreview from "@uiw/react-markdown-preview";

function Preview({ markdown }: { markdown: string }) {
  return (
    <div data-color-mode="dark">
      <MarkdownPreview source={markdown} />
    </div>
  );
}

export default Preview;