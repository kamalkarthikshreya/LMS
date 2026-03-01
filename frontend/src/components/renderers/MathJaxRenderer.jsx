import { MathJax, MathJaxContext } from 'better-react-mathjax';

const config = {
    loader: { load: ['[tex]/html'] },
    tex: {
        packages: { '[+]': ['html'] },
        inlineMath: [
            ['$', '$'],
            ['\\(', '\\)'],
        ],
        displayMath: [
            ['$$', '$$'],
            ['\\[', '\\]'],
        ],
    },
};

const MathJaxRenderer = ({ content }) => {
    return (
        <MathJaxContext config={config}>
            <MathJax dynamic>{content}</MathJax>
        </MathJaxContext>
    );
};

export default MathJaxRenderer;
