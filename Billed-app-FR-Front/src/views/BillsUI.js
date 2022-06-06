import VerticalLayout from "./VerticalLayout.js";
import ErrorPage from "./ErrorPage.js";
import LoadingPage from "./LoadingPage.js";

import Actions from "./Actions.js";

const row = (bill) => {
  return `
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td>${bill.date}</td>
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}
      </td>
    </tr>
    `;
};

const rows = (data) => {
  // Code to modify array elements order containing data by descending order in function of their date

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

  // For each data obj, data.dataCompare store date in format YYYY-MM-DD
  data.forEach((element) => {
    let formatedDate = element.date;
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
    // Storage date format
    element.dateCompare =
      arrFormatedDate[0] + "-" + arrFormatedDate[1] + "-" + arrFormatedDate[2];
  });

  // data sorted by descending order in function of data.dateCompare
  data = data.sort((a, b) => (a.dateCompare < b.dateCompare ? 1 : -1));

  // END bug correction code

  return data && data.length ? data.map((bill) => row(bill)).join("") : "";
};

export default ({ data: bills, loading, error }) => {
  const modal = () => `
    <div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `;

  if (loading) {
    return LoadingPage();
  } else if (error) {
    return ErrorPage(error);
  }

  return `
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(bills)}
          </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`;
};
