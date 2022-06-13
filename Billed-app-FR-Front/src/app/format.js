export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const ye = new Intl.DateTimeFormat("fr", { year: "numeric" }).format(date);
  const mo = new Intl.DateTimeFormat("fr", { month: "long" }).format(date);
  const da = new Intl.DateTimeFormat("fr", { day: "2-digit" }).format(date);
  const month = mo.charAt(0).toUpperCase() + mo.slice(1);

  // [BUG REPORT "Bills" CORRECTION] - Modify array elements order containing data by descending order in function of their date
  // Add switch cases to resolve confusion between french months June & July
  switch (month) {
    case "Juin":
      return `${parseInt(da)} ${month.substr(0, 4)} ${ye
        .toString()
        .substr(2, 4)}`;
      break;
    case "Juillet":
      return `${parseInt(da)} ${month.substr(0, 4)}. ${ye
        .toString()
        .substr(2, 4)}`;
      break;
    case "Mai":
      return `${parseInt(da)} ${month.substr(0, 3)} ${ye
        .toString()
        .substr(2, 4)}`;
      break;
    default:
      return `${parseInt(da)} ${month.substr(0, 3)}. ${ye
        .toString()
        .substr(2, 4)}`;
  }
};

// Add function to Format french date in format YYYY-MM-DD (called in BillUI.js)
export function dateFrToFormatDate(dat) {
  const monthsDateFR = [
    "Jan.",
    "Fev.",
    "Mar.",
    "Avr.",
    "Mai",
    "Juin",
    "Juil.",
    "Aou.",
    "Sep.",
    "Oct.",
    "Nov.",
    "Dec.",
  ];
  let formatedDate = dat;
  let arrFormatedDate = formatedDate.split(" ");
  arrFormatedDate.reverse();
  // Year format
  arrFormatedDate[0] = "20" + arrFormatedDate[0];
  // Month format
  arrFormatedDate[1] = monthsDateFR.indexOf(arrFormatedDate[1]) + 1;
  if (arrFormatedDate[1] < 10) {
    arrFormatedDate[1] = "0" + arrFormatedDate[1];
  }
  // Day format
  if (arrFormatedDate[2] < 10) {
    arrFormatedDate[2] = "0" + arrFormatedDate[2];
  }
  return (
    arrFormatedDate[0] + "-" + arrFormatedDate[1] + "-" + arrFormatedDate[2]
  );
}

// END [BUG REPORT "Bills" CORRECTION]

export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente";
    case "accepted":
      return "Accepté";
    case "refused":
      return "Refused";
  }
};
