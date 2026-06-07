#!/usr/bin/env python3
import os
import sys


def main():
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    original_path = sys.path[:]
    sys.path = [
        path for path in sys.path
        if os.path.abspath(path or os.getcwd()) != repo_root
    ]

    from coverage.cmdline import main as coverage_main

    sys.path = original_path
    return coverage_main(sys.argv[1:])


if __name__ == '__main__':
    raise SystemExit(main())
