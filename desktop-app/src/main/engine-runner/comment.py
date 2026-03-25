import os
from io import StringIO
import tokenize

# ----------------------------
# 🐍 PYTHON COMMENT REMOVAL (SAFE)
# ----------------------------
def remove_python_comments(code: str) -> str:
    result = []

    tokens = tokenize.generate_tokens(StringIO(code).readline)

    for tok_type, tok_string, *_ in tokens:
        if tok_type == tokenize.COMMENT:
            continue
        result.append(tok_string)

    return "".join(result)


# ----------------------------
# 🌐 JS/TS COMMENT REMOVAL (TREE-SITTER)
# ----------------------------
from tree_sitter import Language, Parser
from tree_sitter_javascript import javascript
from tree_sitter_typescript import typescript

js_parser = Parser()
js_parser.set_language(javascript)

ts_parser = Parser()
ts_parser.set_language(typescript)


def remove_js_comments(code: str, parser) -> str:
    tree = parser.parse(bytes(code, "utf8"))
    root = tree.root_node

    # Collect comment ranges
    comment_ranges = []

    def walk(node):
        if node.type == "comment":
            comment_ranges.append((node.start_byte, node.end_byte))
        for child in node.children:
            walk(child)

    walk(root)

    # Remove comments from end to start
    cleaned = code
    for start, end in reversed(comment_ranges):
        cleaned = cleaned[:start] + cleaned[end:]

    return cleaned


# ----------------------------
# 📂 FILE PROCESSING
# ----------------------------
def process_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            code = f.read()

        if file_path.endswith(".py"):
            cleaned = remove_python_comments(code)

        elif file_path.endswith((".js", ".jsx")):
            cleaned = remove_js_comments(code, js_parser)

        elif file_path.endswith((".ts", ".tsx")):
            cleaned = remove_js_comments(code, ts_parser)

        else:
            return

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(cleaned)

        print(f"✔ Cleaned: {file_path}")

    except Exception as e:
        print(f"❌ Error: {file_path} → {e}")


# ----------------------------
# 🚀 WALK FOLDER
# ----------------------------
def process_folder(root_folder):
    for root, _, files in os.walk(root_folder):
        for file in files:
            full_path = os.path.join(root, file)
            process_file(full_path)


# ----------------------------
# ▶️ RUN
# ----------------------------
if __name__ == "__main__":
    folder = input("Enter folder path: ").strip()

    if not os.path.exists(folder):
        print("❌ Invalid path")
    else:
        process_folder(folder)
        print("🔥 Done (safe comment removal)")