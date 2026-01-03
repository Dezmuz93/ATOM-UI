import os

IGNORE_DIRS = {
    "android",
    "node_modules",
    ".git",
    ".next",
    "out",
    "build",
    "dist",
    ".turbo",
    ".vercel",
    "__pycache__"
}

IGNORE_FILES = {
    ".DS_Store"
}


def print_tree(start_path, prefix=""):
    items = sorted(os.listdir(start_path))
    items = [i for i in items if i not in IGNORE_FILES]

    for index, item in enumerate(items):
        path = os.path.join(start_path, item)
        is_last = index == len(items) - 1

        connector = "└── " if is_last else "├── "
        print(prefix + connector + item)

        if os.path.isdir(path) and item not in IGNORE_DIRS:
            extension = "    " if is_last else "│   "
            print_tree(path, prefix + extension)


if __name__ == "__main__":
    root = input("Enter project path (leave empty for current dir): ").strip()
    root = root if root else os.getcwd()

    if not os.path.exists(root):
        print("Path does not exist!")
    else:
        print(os.path.basename(root))
        print_tree(root)