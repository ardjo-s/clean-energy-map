"""Small standard-library XLSX reader for deterministic source ingestion."""

from __future__ import annotations

import re
import xml.etree.ElementTree as ET
import zipfile
from collections.abc import Iterator
from pathlib import Path
from typing import Any

MAIN_NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
CELL_REF = re.compile(r"([A-Z]+)")


def _column_index(reference: str) -> int:
    letters = CELL_REF.match(reference)
    if not letters:
        raise ValueError(f"Invalid cell reference: {reference}")
    result = 0
    for letter in letters.group(1):
        result = result * 26 + ord(letter) - 64
    return result - 1


def _shared_strings(workbook: zipfile.ZipFile) -> list[str]:
    try:
        stream = workbook.open("xl/sharedStrings.xml")
    except KeyError:
        return []
    values: list[str] = []
    with stream:
        for event, element in ET.iterparse(stream, events=("end",)):
            if element.tag == f"{MAIN_NS}si":
                values.append("".join(node.text or "" for node in element.iter(f"{MAIN_NS}t")))
                element.clear()
    return values


def iter_xlsx_rows(path: Path, sheet: str = "xl/worksheets/sheet1.xml") -> Iterator[list[Any]]:
    with zipfile.ZipFile(path) as workbook:
        strings = _shared_strings(workbook)
        with workbook.open(sheet) as stream:
            for event, row in ET.iterparse(stream, events=("end",)):
                if row.tag != f"{MAIN_NS}row":
                    continue
                values: list[Any] = []
                for cell in row.findall(f"{MAIN_NS}c"):
                    index = _column_index(cell.attrib["r"])
                    while len(values) <= index:
                        values.append(None)
                    value_node = cell.find(f"{MAIN_NS}v")
                    raw = value_node.text if value_node is not None else None
                    cell_type = cell.attrib.get("t")
                    if cell_type == "inlineStr":
                        value = "".join(node.text or "" for node in cell.iter(f"{MAIN_NS}t"))
                    elif raw is None:
                        value: Any = None
                    elif cell_type == "s":
                        value = strings[int(raw)]
                    elif cell_type == "b":
                        value = raw == "1"
                    else:
                        try:
                            number = float(raw)
                            value = int(number) if number.is_integer() else number
                        except ValueError:
                            value = raw
                    values[index] = value
                yield values
                row.clear()


def iter_xlsx_records(
    path: Path,
    *,
    header_row: int = 2,
    sheet: str = "xl/worksheets/sheet1.xml",
) -> Iterator[dict[str, Any]]:
    headers: list[str] | None = None
    for row_number, row in enumerate(iter_xlsx_rows(path, sheet), start=1):
        if row_number < header_row:
            continue
        if row_number == header_row:
            headers = [str(value).strip() if value is not None else f"column_{index}" for index, value in enumerate(row)]
            continue
        assert headers is not None
        padded = row + [None] * (len(headers) - len(row))
        yield dict(zip(headers, padded, strict=False))
