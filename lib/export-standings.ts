import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

export type ExportRow = {
  rank: number;
  teamName: string;
  teamTag: string;
  matchesPlayed: number;
  wwcdCount: number;
  totalKills: number;
  avgKills: number;
  placementPoints: number;
  avgPlacement: number;
  totalPoints: number;
  bestPlacement: number;
  highestKills: number;
};

export type ExportOptions = {
  tournamentName: string;
  subtitle?: string;
  organizerName?: string;
  filename?: string;
};

// ── CSV EXPORT ──────────────────────────────────────────────
export function exportToCSV(rows: ExportRow[], opts: ExportOptions) {
  const headers = ["Rank", "Team Tag", "Team Name", "Matches", "WWCD", "Total Kills", "Avg Kills", "Placement Pts", "Avg Placement", "Best Placement", "Highest Kills", "TOTAL POINTS"];
  
  const csvRows = [
    "# " + opts.tournamentName,
    "# " + (opts.subtitle || "Standings"),
    "# Generated: " + new Date().toLocaleString(),
    "# Powered by TournaOps.com",
    "",
    headers.join(","),
    ...rows.map(r => [
      r.rank,
      '"' + r.teamTag + '"',
      '"' + r.teamName + '"',
      r.matchesPlayed,
      r.wwcdCount,
      r.totalKills,
      r.avgKills.toFixed(1),
      r.placementPoints,
      r.avgPlacement.toFixed(1),
      r.bestPlacement === 999 ? "-" : r.bestPlacement,
      r.highestKills,
      r.totalPoints,
    ].join(","))
  ];
  
  const csv = csvRows.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = (opts.filename || opts.tournamentName + "-standings") + ".csv";
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 100);
}

// ── EXCEL EXPORT ────────────────────────────────────────────
export function exportToExcel(rows: ExportRow[], opts: ExportOptions) {
  const wsData = [
    [opts.tournamentName],
    [opts.subtitle || "Standings"],
    ["Organized by: " + (opts.organizerName || "Tournament Organizer")],
    ["Generated: " + new Date().toLocaleString()],
    [],
    ["Rank", "Team Tag", "Team Name", "Matches", "WWCD", "Total Kills", "Avg Kills", "Placement Pts", "Avg Placement", "Best Placement", "Highest Kills", "TOTAL POINTS"],
    ...rows.map(r => [
      r.rank,
      r.teamTag,
      r.teamName,
      r.matchesPlayed,
      r.wwcdCount,
      r.totalKills,
      Number(r.avgKills.toFixed(1)),
      r.placementPoints,
      Number(r.avgPlacement.toFixed(1)),
      r.bestPlacement === 999 ? "-" : r.bestPlacement,
      r.highestKills,
      r.totalPoints,
    ]),
    [],
    ["Powered by TournaOps.com"],
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Column widths
  ws["!cols"] = [
    { wch: 6 },   // Rank
    { wch: 10 },  // Tag
    { wch: 25 },  // Team Name
    { wch: 8 },   // Matches
    { wch: 8 },   // WWCD
    { wch: 12 },  // Total Kills
    { wch: 10 },  // Avg Kills
    { wch: 14 },  // Placement Pts
    { wch: 14 },  // Avg Placement
    { wch: 14 },  // Best Placement
    { wch: 14 },  // Highest Kills
    { wch: 14 },  // Total Points
  ];
  
  // Merge title cells
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 11 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 11 } },
  ];
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Standings");
  
  const filename = (opts.filename || opts.tournamentName + "-standings") + ".xlsx";
  XLSX.writeFile(wb, filename);
}

// ── PDF EXPORT ──────────────────────────────────────────────
export function exportToPDF(rows: ExportRow[], opts: ExportOptions) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Background - dark
  doc.setFillColor(10, 10, 15);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  
  // Yellow accent bar
  doc.setFillColor(255, 215, 0);
  doc.rect(0, 0, pageWidth, 3, "F");
  
  // Header
  doc.setTextColor(255, 215, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("ORGANIZED BY: " + (opts.organizerName || "Tournament Organizer").toUpperCase(), 15, 15);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(opts.tournamentName, 15, 27);
  
  doc.setTextColor(180, 180, 180);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(opts.subtitle || "Overall Standings", 15, 34);
  
  doc.setFontSize(9);
  doc.text("Generated: " + new Date().toLocaleString(), pageWidth - 15, 15, { align: "right" });
  doc.text("Top " + rows.length + " Teams", pageWidth - 15, 21, { align: "right" });
  
  // Line separator
  doc.setDrawColor(255, 215, 0);
  doc.setLineWidth(0.5);
  doc.line(15, 40, pageWidth - 15, 40);
  
  // Table Headers
  const startY = 48;
  const rowHeight = 8;
  const colX = [15, 30, 90, 105, 125, 140, 160, 180, 205, 225, 250];
  const colHeaders = ["Rank", "Team", "M", "WWCD", "Kills", "Avg K", "Place", "Avg P", "Best", "Hi Kill", "TOTAL"];
  const colWidths = [15, 60, 15, 20, 15, 20, 20, 25, 20, 25, 30];
  
  // Header background
  doc.setFillColor(30, 30, 45);
  doc.rect(15, startY - 4, pageWidth - 30, 7, "F");
  
  doc.setTextColor(255, 215, 0);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  colHeaders.forEach((h, i) => {
    doc.text(h, colX[i], startY);
  });
  
  // Rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  
  rows.forEach((r, idx) => {
    const y = startY + 8 + (idx * rowHeight);
    
    if (y > pageHeight - 15) return; // Skip if overflow
    
    // Row background (alternate + special for top 3)
    if (r.rank === 1) {
      doc.setFillColor(60, 45, 5);
    } else if (r.rank === 2) {
      doc.setFillColor(40, 40, 45);
    } else if (r.rank === 3) {
      doc.setFillColor(50, 30, 15);
    } else if (idx % 2 === 0) {
      doc.setFillColor(20, 20, 30);
    } else {
      doc.setFillColor(15, 15, 25);
    }
    doc.rect(15, y - 5, pageWidth - 30, rowHeight - 1, "F");
    
    // Rank color
    if (r.rank === 1) doc.setTextColor(255, 215, 0);
    else if (r.rank === 2) doc.setTextColor(192, 192, 192);
    else if (r.rank === 3) doc.setTextColor(205, 127, 50);
    else doc.setTextColor(255, 255, 255);
    
    doc.setFont("helvetica", "bold");
    doc.text("#" + r.rank, colX[0], y);
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    const teamDisplay = (r.teamTag ? "[" + r.teamTag + "] " : "") + r.teamName;
    doc.text(teamDisplay.length > 30 ? teamDisplay.slice(0, 28) + ".." : teamDisplay, colX[1], y);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(220, 220, 220);
    doc.text(String(r.matchesPlayed), colX[2], y);
    
    // WWCD - gold if > 0
    if (r.wwcdCount > 0) {
      doc.setTextColor(255, 215, 0);
      doc.setFont("helvetica", "bold");
    } else {
      doc.setTextColor(150, 150, 150);
    }
    doc.text(String(r.wwcdCount), colX[3], y);
    
    doc.setTextColor(239, 68, 68);
    doc.setFont("helvetica", "bold");
    doc.text(String(r.totalKills), colX[4], y);
    
    doc.setTextColor(249, 115, 22);
    doc.setFont("helvetica", "normal");
    doc.text(r.avgKills.toFixed(1), colX[5], y);
    
    doc.setTextColor(165, 243, 252);
    doc.text(String(r.placementPoints), colX[6], y);
    
    doc.setTextColor(147, 197, 253);
    doc.text(r.avgPlacement.toFixed(1), colX[7], y);
    
    doc.setTextColor(220, 220, 220);
    doc.text(r.bestPlacement === 999 ? "-" : "#" + r.bestPlacement, colX[8], y);
    
    doc.setTextColor(236, 72, 153);
    doc.text(String(r.highestKills), colX[9], y);
    
    // TOTAL - big gold
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(String(r.totalPoints), colX[10], y);
    doc.setFontSize(8.5);
  });
  
  // Footer
  doc.setTextColor(255, 215, 0);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("TournaOps.com", pageWidth - 15, pageHeight - 8, { align: "right" });
  
  doc.setTextColor(120, 120, 120);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("PMGC Official Scoring System", 15, pageHeight - 8);
  
  // Save
  const filename = (opts.filename || opts.tournamentName + "-standings") + ".pdf";
  doc.save(filename);
}