export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const ye = new Intl.DateTimeFormat("fr", { year: "numeric" }).format(date);
  const mo = new Intl.DateTimeFormat("fr", { month: "long" }).format(date);
  const da = new Intl.DateTimeFormat("fr", { day: "2-digit" }).format(date);
  const month = mo.charAt(0).toUpperCase() + mo.slice(1);

  // Add cases to resolve confusion between french months June & July
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
