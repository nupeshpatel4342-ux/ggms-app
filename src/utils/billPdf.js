import jsPDF from 'jspdf'

/**
 * Generate a professional kirana store thermal receipt PDF (80mm)
 * Two-pass approach: first calculate exact height, then render
 */
export function generateBillPDF(bill, customer, profile) {
  const W = 80  // receipt width mm
  const M = 4   // margin
  const PW = W - M * 2  // printable width

  const hasGST = bill.tax > 0
  const hasDiscount = bill.discount > 0
  const hasCustomer = !!customer
  const hasGSTIN = !!profile?.gstin
  const hasAddress = !!profile?.address
  const hasUPI = !!profile?.upiId && bill.paymentMode !== 'Cash'
  const isVoid = bill.status === 'void'
  const itemCount = bill.items.length

  // --- PASS 1: Calculate exact height needed ---
  let h = 6  // top padding

  if (isVoid) h += 7
  h += 5     // TAX INVOICE label
  h += 7     // Shop name
  if (hasAddress) {
    // rough: ~3.5mm per line, estimate 1-3 lines
    const addrLen = (profile?.address || '').length
    h += Math.ceil(addrLen / 35) * 3.5 + 1
  }
  if (profile?.mobile) h += 4.5
  if (hasGSTIN) h += 4
  h += 5     // double line + space

  // Bill info
  h += 13    // Bill No + Date + Time
  if (hasCustomer) {
    h += 5   // dashed line + customer
    if (customer?.mobile) h += 4
    h += 2
  }
  h += 3     // solid line

  // Items header
  h += 7     // header row + line

  // Items (each item = 2 lines)
  h += itemCount * 9

  h += 4     // double line + space

  // Totals
  h += 5     // Total items/qty
  h += 5     // Subtotal
  if (hasGST) h += 8    // CGST + SGST
  if (hasDiscount) h += 5
  h += 5     // round off (may or may not show, safe to include)

  // Grand total
  h += 12    // double lines + GRAND TOTAL + double lines

  // Payment
  h += 6

  // You saved
  if (hasDiscount) h += 8

  // UPI
  if (hasUPI) h += 10

  // Footer
  h += 20    // Thank you + terms + padding

  // Safety buffer
  h += 8

  // --- PASS 2: Render the PDF ---
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [W, h] })

  let y = 6
  const LX = M
  const RX = W - M

  // ═══════════ VOID STAMP ═══════════
  if (isVoid) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(200, 0, 0)
    doc.text('*** CANCELLED ***', W / 2, y, { align: 'center' })
    doc.setTextColor(0, 0, 0)
    y += 7
  }

  // ═══════════ HEADER ═══════════
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(100, 100, 100)
  doc.text('TAX INVOICE', W / 2, y, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  y += 5

  // Shop Name
  const shopName = (profile?.shopName || 'GGM&S Retail').toUpperCase()
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(shopName, W / 2, y, { align: 'center' })
  y += 5

  // Address
  if (hasAddress) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    const addrLines = doc.splitTextToSize(profile.address, PW - 4)
    addrLines.forEach(line => {
      doc.text(line, W / 2, y, { align: 'center' })
      y += 3.5
    })
  }

  // Phone
  if (profile?.mobile) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text('Ph: ' + profile.mobile, W / 2, y, { align: 'center' })
    y += 4
  }

  // GSTIN
  if (hasGSTIN) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.text('GSTIN: ' + profile.gstin, W / 2, y, { align: 'center' })
    y += 4
  }

  // === Double separator ===
  y += 1
  doc.setLineWidth(0.4)
  doc.line(LX, y, RX, y)
  doc.line(LX, y + 0.8, RX, y + 0.8)
  y += 4

  // ═══════════ BILL INFO ═══════════
  const billDate = new Date(bill.date)
  const dateStr = billDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr = billDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Bill No:', LX, y)
  doc.setFont('helvetica', 'bold')
  doc.text(bill.id, RX, y, { align: 'right' })
  y += 4

  doc.setFont('helvetica', 'normal')
  doc.text('Date:', LX, y)
  doc.text(dateStr, RX, y, { align: 'right' })
  y += 4

  doc.text('Time:', LX, y)
  doc.text(timeStr, RX, y, { align: 'right' })
  y += 4

  // Customer
  if (hasCustomer) {
    // dashed line
    doc.setLineDash([1, 1], 0)
    doc.setLineWidth(0.15)
    doc.line(LX, y, RX, y)
    doc.setLineDash([])
    y += 4

    doc.setFont('helvetica', 'normal')
    doc.text('Customer:', LX, y)
    doc.setFont('helvetica', 'bold')
    doc.text(customer.name, RX, y, { align: 'right' })
    y += 4

    if (customer.mobile) {
      doc.setFont('helvetica', 'normal')
      doc.text('Mobile:', LX, y)
      doc.text(customer.mobile, RX, y, { align: 'right' })
      y += 4
    }
  }

  // === Thick line ===
  y += 1
  doc.setLineWidth(0.5)
  doc.line(LX, y, RX, y)
  y += 4

  // ═══════════ ITEMS TABLE HEADER ═══════════
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.text('SR', LX, y)
  doc.text('ITEM', LX + 8, y)
  doc.text('QTY', W / 2, y, { align: 'center' })
  doc.text('RATE', RX - 16, y, { align: 'right' })
  doc.text('AMT', RX, y, { align: 'right' })
  y += 2

  doc.setLineWidth(0.25)
  doc.line(LX, y, RX, y)
  y += 4

  // ═══════════ ITEMS ═══════════
  let totalQty = 0
  bill.items.forEach((item, i) => {
    const amt = item.quantity * item.sellingPrice
    totalQty += item.quantity
    const qtyStr = Number.isInteger(item.quantity) ? String(item.quantity) : item.quantity.toFixed(2)
    const unit = item.unit || 'pcs'

    // Truncate long names
    const maxNameLen = 20
    const name = item.name.length > maxNameLen ? item.name.substring(0, maxNameLen) + '..' : item.name

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(String(i + 1), LX + 3, y, { align: 'right' })
    doc.text(name, LX + 8, y)

    doc.setFontSize(7.5)
    doc.text(qtyStr + ' ' + unit, W / 2, y, { align: 'center' })
    doc.text(item.sellingPrice.toFixed(0), RX - 16, y, { align: 'right' })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.text(amt.toFixed(2), RX, y, { align: 'right' })

    y += 5

    // Add light separator between items
    if (i < bill.items.length - 1) {
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.1)
      doc.line(LX + 8, y - 1.5, RX, y - 1.5)
      doc.setDrawColor(0, 0, 0)
    }
  })

  // === Double separator ===
  y += 1
  doc.setLineWidth(0.4)
  doc.setDrawColor(0, 0, 0)
  doc.line(LX, y, RX, y)
  doc.line(LX, y + 0.8, RX, y + 0.8)
  y += 4

  // ═══════════ SUMMARY ═══════════

  // Total Items & Qty
  const totalQtyStr = Number.isInteger(totalQty) ? String(totalQty) : totalQty.toFixed(2)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(100, 100, 100)
  doc.text('Total Items: ' + bill.items.length + '  |  Qty: ' + totalQtyStr, LX, y)
  doc.setTextColor(0, 0, 0)
  y += 5

  // Subtotal
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.text('Subtotal', LX, y)
  doc.setFont('helvetica', 'bold')
  doc.text('Rs ' + bill.subtotal.toFixed(2), RX, y, { align: 'right' })
  y += 4.5

  // CGST + SGST
  if (hasGST) {
    const halfTax = (bill.tax / 2).toFixed(2)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.text('CGST (2.5%)', LX, y)
    doc.text('Rs ' + halfTax, RX, y, { align: 'right' })
    y += 3.5
    doc.text('SGST (2.5%)', LX, y)
    doc.text('Rs ' + halfTax, RX, y, { align: 'right' })
    y += 4.5
  }

  // Discount
  if (hasDiscount) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text('Discount', LX, y)
    doc.text('-Rs ' + bill.discount.toFixed(2), RX, y, { align: 'right' })
    y += 4.5
  }

  // Round off
  const rawTotal = bill.subtotal + (bill.tax || 0) - (bill.discount || 0)
  const roundOff = bill.total - rawTotal
  if (Math.abs(roundOff) >= 0.01) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(100, 100, 100)
    doc.text('Round Off', LX, y)
    doc.text('Rs ' + roundOff.toFixed(2), RX, y, { align: 'right' })
    doc.setTextColor(0, 0, 0)
    y += 4
  }

  // ═══════════ GRAND TOTAL ═══════════
  y += 1
  doc.setLineWidth(0.5)
  doc.line(LX, y, RX, y)
  doc.line(LX, y + 0.8, RX, y + 0.8)
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('GRAND TOTAL', LX, y)
  doc.setFontSize(13)
  doc.text('Rs ' + bill.total.toFixed(2), RX, y, { align: 'right' })
  y += 3

  doc.setLineWidth(0.5)
  doc.line(LX, y, RX, y)
  doc.line(LX, y + 0.8, RX, y + 0.8)
  y += 5

  // ═══════════ PAYMENT ═══════════
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Paid by: ' + bill.paymentMode.toUpperCase(), W / 2, y, { align: 'center' })
  y += 5

  // You Saved
  if (hasDiscount) {
    doc.setLineDash([1, 1], 0)
    doc.setLineWidth(0.15)
    doc.line(LX, y, RX, y)
    doc.setLineDash([])
    y += 4
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(46, 125, 50)
    doc.text('You Saved Rs ' + bill.discount.toFixed(2) + ' on this bill!', W / 2, y, { align: 'center' })
    doc.setTextColor(0, 0, 0)
    y += 5
  }

  // UPI
  if (hasUPI) {
    doc.setLineDash([1, 1], 0)
    doc.setLineWidth(0.15)
    doc.line(LX, y, RX, y)
    doc.setLineDash([])
    y += 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text('Pay via UPI:', W / 2, y, { align: 'center' })
    y += 3.5
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.text(profile.upiId, W / 2, y, { align: 'center' })
    y += 5
  }

  // ═══════════ FOOTER ═══════════
  doc.setLineDash([1, 1], 0)
  doc.setLineWidth(0.15)
  doc.line(LX, y, RX, y)
  doc.setLineDash([])
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Thank You! Visit Again!', W / 2, y, { align: 'center' })
  y += 4.5

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.setTextColor(120, 120, 120)
  doc.text('Goods once sold will not be taken back.', W / 2, y, { align: 'center' })
  y += 3
  doc.text('Subject to local jurisdiction. E. & O.E.', W / 2, y, { align: 'center' })
  doc.setTextColor(0, 0, 0)

  return doc
}

/**
 * Print bill PDF - opens in new window with auto-print
 */
export function printBillPDF(bill, customer, profile) {
  const doc = generateBillPDF(bill, customer, profile)
  doc.autoPrint()
  const blobUrl = doc.output('bloburl')
  window.open(blobUrl, '_blank')
}

/**
 * Share bill via WhatsApp with PDF attachment
 */
export function shareBillWhatsApp(bill, customer, profile) {
  const doc = generateBillPDF(bill, customer, profile)
  const pdfBlob = doc.output('blob')
  const fileName = 'Bill_' + bill.id + '.pdf'

  if (navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], fileName, { type: 'application/pdf' })] })) {
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' })
    navigator.share({
      files: [file],
      title: 'Bill ' + bill.id,
      text: 'Here is your bill from ' + (profile?.shopName || 'GGM&S Retail'),
    }).catch(() => {})
  } else {
    doc.save(fileName)
    const text = 'Bill from *' + (profile?.shopName || 'GGM&S Retail') + '*\n\nBill No: ' + bill.id + '\nDate: ' + new Date(bill.date).toLocaleDateString() + '\nTotal: Rs ' + bill.total.toFixed(2) + '\nPayment: ' + bill.paymentMode + '\n\n_PDF attached separately._'
    let url = 'https://wa.me/'
    if (customer && customer.mobile) {
      url += '91' + customer.mobile + '?text=' + encodeURIComponent(text)
    } else {
      url += '?text=' + encodeURIComponent(text)
    }
    setTimeout(() => { window.open(url, '_blank') }, 500)
  }
}

/**
 * Download bill PDF
 */
export function downloadBillPDF(bill, customer, profile) {
  const doc = generateBillPDF(bill, customer, profile)
  doc.save('Bill_' + bill.id + '.pdf')
}
