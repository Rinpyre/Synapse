# LaTeX Beginner's Guide

## What is LaTeX?

LaTeX is a document preparation system that makes it easy to create professional documents like reports, theses, and papers. Instead of worrying about formatting while you type (like in Word), you focus on the content, and LaTeX handles the beautiful formatting automatically.

## Key Concepts

### Packages (The Tools You Need)

Think of packages as add-ons or extensions that give LaTeX new powers. Each package adds specific features. You load them at the top of your document using `\usepackage{}`.

**Packages used in this project:**

| Package          | What It Does                                                                   |
| ---------------- | ------------------------------------------------------------------------------ |
| `graphicx`       | Lets you insert images into your document                                      |
| `geometry`       | Lets you adjust page margins (spacing around edges)                            |
| `hyperref`       | Makes links in your PDF clickable (`[hidelinks]` removes the coloured boxes)   |
| `titlesec`       | Lets you completely redesign section and subsection titles                     |
| `fancyhdr`       | Lets you customize headers (text at top) and footers (text at bottom) of pages |
| `inputenc[utf8]` | Handles special characters (accents, symbols, etc.)                            |
| `tocloft`        | Lets you customize the Table of Contents appearance (dots, spacing, etc.)      |
| `amssymb`        | Provides extra math symbols like `\checkmark` (✓)                              |
| `float`          | Gives you the `[H]` specifier to force a table/figure exactly where you put it |
| `color`          | Lets you colour text with `\color{red}` and similar commands                   |

### Document Structure

```latex
\documentclass[12pt]{article}  % Sets the type and font size of document
\usepackage{...}               % Add packages here (before \begin{document})
\begin{document}
  % YOUR CONTENT GOES HERE
\end{document}
```

> **`article` vs `report`:** We use `article` because it's simpler — it has sections but no chapters. Use `report` when you need `\chapter{}` headings (e.g. a longer thesis-style document).

## Customizing Your Document

### 1. Customizing Section Titles with `titlesec`

By default, LaTeX's section titles look plain. The `titlesec` package lets you control their size, weight, and numbering style.

**The Command:**

```latex
\titleformat{\section}
  {\large\bfseries}   % How it looks (large and bold)
  {\thesection.}      % What the number looks like (e.g., "1.")
  {0.25em}            % Space between number and title text
  {}                  % Extra code before the title (leave empty usually)
```

Works the same for `\subsection`, `\subsubsection`, etc.

**The Spacing:**

```latex
\titlespacing{\section}{0pt}{12pt}{6pt}
  % {left indent}{space above title}{space below title}
```

### 2. Embedding an Image in the Header

You can put a logo image directly inside `\fancyhead` using `\includegraphics`:

```latex
\fancyhead[R]{\includegraphics[height=0.45cm]{./images/logo.png}}
```

The `height=0.45cm` keeps it small enough to fit neatly in the header line.

### 3. Customizing Headers and Footers with `fancyhdr`

Headers appear at the top of each page, footers at the bottom.

**Setup:**

```latex
\usepackage{fancyhdr}
\pagestyle{fancy}    % Turn on custom headers
\fancyhf{}           % Clear any default headers/footers
```

**Adding Content:**

```latex
\fancyhead[L]{Left Text}          % Text on left side of header
\fancyhead[R]{Right Text}         % Text on right side of header
\fancyhead[C]{Center Text}        % Text in center of header
\fancyfoot[C]{\thepage}           % Page number in center of footer
```

**Position Codes:** L = Left, R = Right, C = Center

**Example:**

```latex
\fancyhead[L]{Group 12 Report}    % Left header
\fancyhead[R]{Course Name}        % Right header
\fancyfoot[C]{\thepage}           % Centered page numbers
```

### 4. Creating a Custom Title Page

Instead of letting LaTeX create a title page automatically, you can design your own:

```latex
\begin{titlepage}
    \centering                      % Center everything
    \vspace*{2cm}                   % Add 2cm of space from top

    {\Huge\bfseries My Document}    % Big bold title
    \vspace{1.5cm}                  % Space after title

    {\Large \textbf{Authors:}} \\   % Author heading
    John Doe \\                     % Author 1
    Jane Smith \\                   % Author 2

    \vfill                          % Push everything below to the bottom
    {\large \today}                 % Today's date at bottom
\end{titlepage}
```

### 5. Overriding Default Commands with `\renewcommand`

Sometimes you want to change how a built-in LaTeX command behaves. `\renewcommand` lets you replace it:

```latex
\renewcommand{\contentsname}{My Custom TOC Title}
```

This is used a lot with the `tocloft` package to customize how the Table of Contents looks (dot leaders, number widths, fonts, etc.).

## Text Formatting Basics

| Code                           | Result      | Use For           |
| ------------------------------ | ----------- | ----------------- |
| `\textbf{text}` or `\bfseries` | **text**    | Bold              |
| `\textit{text}` or `\itshape`  | _text_      | Italic            |
| `\texttt{text}` or `\ttfamily` | `text`      | Code/Monospace    |
| `\huge`                        | HUGE        | Really large text |
| `\Large`                       | Larger      | Large text        |
| `\small`                       | small       | Small text        |
| `\centering`                   | center this | Center text       |

## Document Structure Commands

| Command            | What It Does                                                           |
| ------------------ | ---------------------------------------------------------------------- |
| `\section{}`       | Start a new section (numbered: 1, 2, 3…)                               |
| `\subsection{}`    | Start a subsection (numbered: 1.1, 1.2…)                               |
| `\newpage`         | Force a page break                                                     |
| `\tableofcontents` | Auto-generate a table of contents from your sections                   |
| `{...}`            | Curly braces create a "group" — formatting only affects content inside |
| `\\`               | Line break (move to next line, not a new paragraph)                    |
| `\par`             | End a paragraph (same as pressing Enter twice in Word)                 |
| `\today`           | Inserts the current date automatically                                 |
| `\checkmark`       | Inserts a ✓ symbol (requires the `amssymb` package)                    |

## Bullet Lists

`\begin{itemize}` creates an unordered bullet list. Each item starts with `\item`.

```latex
\begin{itemize}
    \item First point
    \item \textit{Italicised point}
    \item Point with \textbf{bold} word
\end{itemize}
```

For numbered lists, use `enumerate` instead of `itemize`:

```latex
\begin{enumerate}
    \item First item
    \item Second item
\end{enumerate}
```

## Tables

Tables use the `tabular` environment. The column format goes in curly braces after `\begin{tabular}`:

- `l` — left-aligned column
- `c` — centred column
- `r` — right-aligned column
- `p{5cm}` — fixed-width column (wraps text)
- `|` — draws a vertical border between columns

```latex
\begin{table}[H]   % [H] forces the table to appear exactly here (needs float package)
    \centering
    \renewcommand{\arraystretch}{1.2}   % Increases row height (1 = default)
    \begin{tabular}{|c|l|p{6cm}|}
        \hline                          % Horizontal line
        \textbf{Col 1} & \textbf{Col 2} & \textbf{Col 3} \\
        \hline
        A              & Apple          & A longer description that will wrap \\
        B              & Banana         & Another description                  \\
        \hline
    \end{tabular}
\end{table}
```

> **`[H]` vs `[h]`:** LaTeX normally floats tables to wherever it thinks looks best. `[H]` (from the `float` package) overrides this and places the table exactly where you wrote it.

## Text Colors

The `color` package lets you color text inline:

```latex
{\color{red}\textbf{*}}   % Red bold asterisk, affects only what's inside { }
\textcolor{blue}{some text}  % Alternative syntax
```

Basic color names: `red`, `blue`, `green`, `black`, `white`, `gray`, `yellow`, `cyan`, `magenta`.

## Special Spacing Commands

| Command         | What It Does                              |
| --------------- | ----------------------------------------- |
| `\vspace{2cm}`  | Add 2cm of vertical space (height)        |
| `\vspace*{2cm}` | Same, but won't be removed at top of page |
| `\hspace{2cm}`  | Add 2cm of horizontal space (width)       |
| `\vfill`        | Fill all remaining vertical space on page |
| `\\`            | Line break                                |

## Common Mistakes to Avoid

1. **Forgetting curly braces `{}`** - Commands like `\textbf{bold text}` need braces around what they apply to
2. **Using regular quotes ""** instead of **backticks and apostrophes** `` `quotes' `` for proper typeset quotes
3. **Forgetting `\begin{document}` and `\end{document}`** - Everything outside these is treated as configuration
4. **Using `_` or `^` outside of math mode** - Use `\_` or `\^{}` in regular text
5. **Not compiling often** - Compile after each section to catch errors early

## Compilation

To turn your `.tex` file into a PDF:

- **In VS Code:** Look for a "Compile LaTeX" button or use the LaTeX extension
- **Command line:** `pdflatex yourfile.tex`
- **Result:** Creates a `yourfile.pdf` file

## Getting Help

- **Missing `}` errors:** Count your `{` and `}` - they must match
- **Package not found:** Make sure `\usepackage{name}` is before `\begin{document}`
- **Text not showing:** Check if it's between `\begin{document}` and `\end{document}`
- **Weird spacing:** Try adding `%` at end of affected lines to remove hidden spaces LaTeX creates
