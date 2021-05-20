const { jsPDF } = require("jspdf");
const autoTable = require("jspdf-autotable")
const { DateTime } = require("luxon");

const CreatePDF = (personalData, shoeData, styleData) => {
  const { FirstName, LastName, size, shoeSize, Birth, gender, streetNumber, city, state, postalCode, country } = personalData
  const formattedsizes = shoeData.map(i => Object.values(i));
  const formattedstyles = styleData.map(i => Object.values(i));

  let genderLocalized

  if (gender === "male") {
    genderLocalized = "male"
  } else {
    genderLocalized = "Female"
  }

  const doc = new jsPDF();
  
  doc.autoTable({
    bodyStyles: { halign: "right" },
    body: [
      [DateTime.local().setLocale("gb").toLocaleString("DATE_SHORT")],
    ],
    theme: "plain"
  })

  doc.autoTable({
    headStyles: { fontSize:16 },
    head: [
      ["Retail identity"],
    ],
    theme: "plain"
  })

  doc.autoTable({
    head: [
      ["First Name", "Surname", "Date of Birth", "Gender"]
    ],
    body: [
      [FirstName, LastName, DateTime.fromISO(Birth).setLocale("gb").toLocaleString("DATE_SHORT"), genderLocalized],
    ],
    theme: "plain",
  })
  doc.autoTable({
    head: [
      ["Size", "Shoe Size"]
    ],
    body: [
      [size, shoeSize],
    ],
    theme: "plain",
  })
  doc.autoTable({
    head: [
      ["Address"]
    ],
    body: [
      [`${streetNumber}, ${postalCode} ${city} ${state} ${country}`],
    ],
    theme: "plain",
  })

  doc.autoTable({
    head: [["Sizes", "styles"]],
    body: formattedsizes
  })

  doc.autoTable({
    head: [["Colours", "Channel", "Sustainable", "Trend"]],
    body: formattedstyles,
  })

  doc.setFontSize(10)
  doc.setFont("helvetica")
  doc.text("This is your ILAB identity", 14, doc.lastAutoTable.finalY + 10)
  
  const string = doc.output("arraybuffer");
  return string
}

module.exports = { CreatePDF }