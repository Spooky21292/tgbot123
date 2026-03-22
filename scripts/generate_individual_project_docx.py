from __future__ import annotations

import re
import zipfile
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs' / 'FinSkills_Pro_Individual_Project.md'
OUTPUT = ROOT / 'docs' / 'FinSkills_Pro_Individual_Project.docx'


def paragraph_xml(text: str, style: str | None = None, align: str | None = None, page_break_before: bool = False) -> str:
    text = escape(text)
    ppr = []
    if style:
        ppr.append(f'<w:pStyle w:val="{style}"/>')
    if align:
        ppr.append(f'<w:jc w:val="{align}"/>')
    if page_break_before:
        ppr.append('<w:pageBreakBefore/>')
    ppr_xml = f"<w:pPr>{''.join(ppr)}</w:pPr>" if ppr else ''
    return f'<w:p>{ppr_xml}<w:r><w:t xml:space="preserve">{text}</w:t></w:r></w:p>'


def blank_paragraph() -> str:
    return '<w:p/>'


def make_table(rows: list[list[str]]) -> str:
    tbl_rows = []
    for ridx, row in enumerate(rows):
        cells = []
        for cell in row:
            cell_text = escape(cell)
            tc_pr = '<w:tcPr><w:tcW w:w="3200" w:type="dxa"/></w:tcPr>'
            p_style = 'TableHeader' if ridx == 0 else 'TableBody'
            cells.append(f'<w:tc>{tc_pr}{paragraph_xml(cell_text, style=p_style)}</w:tc>')
        tbl_rows.append(f'<w:tr>{"".join(cells)}</w:tr>')
    tbl_pr = ('<w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="0" w:type="auto"/>'
              '<w:tblBorders><w:top w:val="single" w:sz="8" w:space="0" w:color="BFC7D5"/>'
              '<w:left w:val="single" w:sz="8" w:space="0" w:color="BFC7D5"/>'
              '<w:bottom w:val="single" w:sz="8" w:space="0" w:color="BFC7D5"/>'
              '<w:right w:val="single" w:sz="8" w:space="0" w:color="BFC7D5"/>'
              '<w:insideH w:val="single" w:sz="8" w:space="0" w:color="BFC7D5"/>'
              '<w:insideV w:val="single" w:sz="8" w:space="0" w:color="BFC7D5"/></w:tblBorders></w:tblPr>')
    return f'<w:tbl>{tbl_pr}{"".join(tbl_rows)}</w:tbl>'


def parse_markdown(text: str) -> str:
    body_parts: list[str] = []
    lines = text.splitlines()
    i = 0
    first_h1 = True
    while i < len(lines):
        line = lines[i].rstrip()
        if not line.strip():
            body_parts.append(blank_paragraph())
            i += 1
            continue
        if line == '---':
            body_parts.append(paragraph_xml('', page_break_before=True))
            i += 1
            continue
        if line.startswith('# '):
            style = 'Title' if first_h1 else 'Heading1'
            body_parts.append(paragraph_xml(line[2:].strip(), style=style, align='center' if first_h1 else None, page_break_before=not first_h1))
            first_h1 = False
            i += 1
            continue
        if line.startswith('## '):
            body_parts.append(paragraph_xml(line[3:].strip(), style='Heading1', page_break_before=True))
            i += 1
            continue
        if line.startswith('### '):
            body_parts.append(paragraph_xml(line[4:].strip(), style='Heading2'))
            i += 1
            continue
        if line.startswith('|') and i + 1 < len(lines) and lines[i + 1].startswith('|---'):
            table_lines = []
            while i < len(lines) and lines[i].startswith('|'):
                table_lines.append(lines[i])
                i += 1
            rows = []
            for idx, raw in enumerate(table_lines):
                if idx == 1:
                    continue
                parts = [part.strip() for part in raw.strip('|').split('|')]
                rows.append(parts)
            body_parts.append(make_table(rows))
            continue
        # bullets as normal paragraphs with dot
        if re.match(r'^\d+\. ', line):
            body_parts.append(paragraph_xml(line, style='BodyText'))
            i += 1
            continue
        if line.startswith('**') and line.endswith('**'):
            body_parts.append(paragraph_xml(line.strip('*'), style='Subtitle', align='center'))
            i += 1
            continue
        cleaned = re.sub(r'\s{2,}$', '', line)
        cleaned = re.sub(r'\*\*(.*?)\*\*', r'\1', cleaned)
        body_parts.append(paragraph_xml(cleaned, style='BodyText'))
        i += 1
    sect = (
        '<w:sectPr>'
        '<w:pgSz w:w="11906" w:h="16838"/>'
        '<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1417" w:header="708" w:footer="708" w:gutter="0"/>'
        '</w:sectPr>'
    )
    return ''.join(body_parts) + sect


def build_styles() -> str:
    return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:rPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="120" w:line="360" w:lineRule="auto"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:before="240" w:after="200"/><w:jc w:val="center"/></w:pPr><w:rPr><w:b/><w:sz w:val="40"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:before="120" w:after="120"/><w:jc w:val="center"/></w:pPr><w:rPr><w:b/><w:sz w:val="28"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="Heading 1"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr><w:rPr><w:b/><w:sz w:val="32"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="Heading 2"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:before="160" w:after="80"/></w:pPr><w:rPr><w:b/><w:sz w:val="30"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="BodyText"><w:name w:val="Body Text"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:ind w:firstLine="709"/><w:spacing w:after="120" w:line="360" w:lineRule="auto"/></w:pPr><w:rPr><w:sz w:val="28"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="TableHeader"><w:name w:val="Table Header"/><w:basedOn w:val="Normal"/><w:qFormat/><w:rPr><w:b/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="TableBody"><w:name w:val="Table Body"/><w:basedOn w:val="Normal"/><w:qFormat/></w:style>
</w:styles>'''


def build_document_xml(body: str) -> str:
    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
 xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
 xmlns:v="urn:schemas-microsoft-com:vml"
 xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
 xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
 xmlns:w10="urn:schemas-microsoft-com:office:word"
 xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
 xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
 xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
 xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
 xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
 xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
 mc:Ignorable="w14 wp14">
 <w:body>{body}</w:body>
</w:document>'''


def build_content_types() -> str:
    return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>'''


def build_root_rels() -> str:
    return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>'''


def build_document_rels() -> str:
    return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>'''


def build_core() -> str:
    return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>FinSkills Pro — индивидуальный проект</dc:title>
  <dc:creator>OpenAI Codex</dc:creator>
  <cp:lastModifiedBy>OpenAI Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-03-22T00:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2026-03-22T00:00:00Z</dcterms:modified>
</cp:coreProperties>'''


def build_app() -> str:
    return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Office Word</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <Company>OpenAI</Company>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0000</AppVersion>
</Properties>'''


def main() -> None:
    markdown = SOURCE.read_text(encoding='utf-8')
    body = parse_markdown(markdown)
    with zipfile.ZipFile(OUTPUT, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr('[Content_Types].xml', build_content_types())
        zf.writestr('_rels/.rels', build_root_rels())
        zf.writestr('word/document.xml', build_document_xml(body))
        zf.writestr('word/_rels/document.xml.rels', build_document_rels())
        zf.writestr('word/styles.xml', build_styles())
        zf.writestr('docProps/core.xml', build_core())
        zf.writestr('docProps/app.xml', build_app())
    print(f'Created {OUTPUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
