if (window.mermaid) {
  window.mermaid.initialize({
    startOnLoad: true,
    theme: "neutral",
    flowchart: {
      useMaxWidth: false,
      htmlLabels: true
    }
  });

  window.mermaid.init(undefined, document.querySelectorAll(".language-mermaid"));
}
