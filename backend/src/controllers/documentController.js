const PDFDocument = require('pdfkit');
const archiver = require('archiver');
const { Order, User, Product } = require('../models');
const path = require('path');

exports.generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId, {
      include: [{ model: User, attributes: ['firstName', 'lastName', 'email', 'address'] }]
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const doc = new PDFDocument({ margin: 50 });
    const filename = `invoice_${order.orderNumber}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    doc.pipe(res);
    
    // Header
    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Order #: ${order.orderNumber}`, { align: 'right' });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: 'right' });
    doc.moveDown();
    
    // Bill To
    doc.fontSize(12).text('Bill To:', { underline: true });
    doc.fontSize(10).text(`${order.User.firstName} ${order.User.lastName}`);
    doc.text(order.User.email);
    if (order.User.address) doc.text(order.User.address);
    doc.moveDown();
    
    // Items Table
    const tableTop = doc.y;
    doc.fontSize(10);
    doc.text('Item', 50, tableTop);
    doc.text('Qty', 250, tableTop);
    doc.text('Price', 350, tableTop);
    doc.text('Total', 450, tableTop);
    
    let y = tableTop + 20;
    let subtotal = 0;
    
    order.items.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      doc.text(item.name, 50, y);
      doc.text(item.quantity.toString(), 250, y);
      doc.text(`R${item.price.toFixed(2)}`, 350, y);
      doc.text(`R${itemTotal.toFixed(2)}`, 450, y);
      y += 20;
    });
    
    // Totals
    y += 20;
    doc.text(`Subtotal: R${subtotal.toFixed(2)}`, 350, y);
    doc.text(`Tax (15%): R${(subtotal * 0.15).toFixed(2)}`, 350, y + 20);
    doc.text(`Total: R${order.total.toFixed(2)}`, 350, y + 40);
    
    // Footer
    doc.fontSize(8).text('Thank you for your business!', 50, 750, { align: 'center' });
    
    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating invoice' });
  }
};

exports.generateReport = async (req, res) => {
  try;
    const { type, startDate, endDate } = req.query;
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="report.zip"');
    
    archive.pipe(res);
    
    if (type === 'orders' || type === 'all') {
      const orders = await Order.findAll({
        where: {
          createdAt: {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          }
        },
        include: [{ model: User, attributes: ['firstName', 'lastName', 'email'] }]
      });
      
      const ordersJson = JSON.stringify(orders, null, 2);
      archive.append(ordersJson, { name: 'orders.json' });
      
      // Generate CSV version
      let csv = 'Order #,Date,Customer,Total,Status\n';
      orders.forEach(order => {
        csv += `${order.orderNumber},${order.createdAt},${order.User?.firstName} ${order.User?.lastName},${order.total},${order.status}\n`;
      });
      archive.append(csv, { name: 'orders.csv' });
    }
    
    if (type === 'products' || type === 'all') {
      const products = await Product.findAll();
      archive.append(JSON.stringify(products, null, 2), { name: 'products.json' });
    }
    
    await archive.finalize();
  } catch (error) {
    res.status(500).json({ message: 'Error generating report' });
  }
};

exports.generateCustomPDF = async (req, res) => {
  try {
    const { title, content, data } = req.body;
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf"`);
    
    doc.pipe(res);
    doc.fontSize(18).text(title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(content);
    
    if (data && typeof data === 'object') {
      doc.moveDown();
      doc.text(JSON.stringify(data, null, 2));
    }
    
    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Error generating PDF' });
  }
};
