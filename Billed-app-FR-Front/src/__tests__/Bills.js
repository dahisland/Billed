/**
 * @jest-environment jsdom
 */

import { fireEvent, getByTestId, screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import store from "../app/Store.js";
import { formatDate, formatStatus } from "../app/format";
import storeMock from "../__mocks__/store.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

//jest.mock("../app/store", () => storeMock)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon.getAttribute("class")).toBe("active-icon");
      //expect have class active-icon (MM)
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });

  // Add test for add new bill functionnality (MM)
  describe("When I click on button : Add new bill", () => {
    test("Then page should display form : Send new bill", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const getBillsToDisplay = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      document.body.innerHTML = BillsUI({ data: bills });
      const btnAddBill = screen.getByTestId("btn-new-bill");

      expect(btnAddBill).toBeDefined();

      btnAddBill.addEventListener(
        "click",
        jest.fn(getBillsToDisplay.handleClickNewBill)
      );
      userEvent.click(btnAddBill);
      const textSendBill = screen.getByText("Envoyer une note de frais");

      expect(textSendBill).toBeTruthy();
    });
  });
  // Add test for add new bill functionnality (MM)
  describe("When I click on icon eye : display proof", () => {
    test("Then page should open a modale displaying proof", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const getBillsToDisplay = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      document.body.innerHTML = BillsUI({ data: bills });
      const btnIconEye = screen.getAllByTestId("icon-eye");

      $.fn.modal = jest.fn();

      btnIconEye.forEach((icon) => {
        expect(icon).toBeDefined();
        icon.addEventListener(
          "click",
          jest.fn(getBillsToDisplay.handleClickIconEye(icon))
        );
      });
      userEvent.click(btnIconEye[0]);
      const containerProof = screen.getByTestId("container-proof-modal");

      expect(containerProof).toBeTruthy();
    });
  });

  // Add test for getBills() (MM)
  describe("Given I am connected as an employee", () => {
    describe("When bills page is loaded", () => {
      test("Then bills should be fetched with API GET", () => {
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);

        router();
        window.onNavigate(ROUTES_PATH.Bills);

        expect(screen.getByTestId("tbody").innerHTML).not.toBe("");
      });
      test("Then I should see bills with date formatted & status", async () => {
        const getBillsToDisplay = new Bills({
          document,
          onNavigate,
          store: storeMock,
          localStorage: window.localStorage,
        });

        const arrBillsToDisplay = await getBillsToDisplay.getBills();
        const arrBillsStoredMock = await storeMock.bills().list();

        document.body.innerHTML = BillsUI({ data: arrBillsToDisplay });

        const dateInStore = formatDate(arrBillsStoredMock[0].date);
        const statusInStore = formatStatus(arrBillsStoredMock[0].status);

        const firstBillDisplayed =
          screen.getByTestId("tbody").firstElementChild.innerHTML;

        expect(firstBillDisplayed).toMatch(new RegExp(`${dateInStore}`));
        expect(firstBillDisplayed).toMatch(new RegExp(`${statusInStore}`));
      });
    });
    // Test when error in date (MM)
    describe("When a bills data date has error", () => {
      test("Then date should not be formatted", async () => {
        // store mock with corrupted date in data (MM)
        const listCorruptMock = {
          list() {
            return Promise.resolve([
              {
                id: "47qAXb6fIm2zOKkLzMro",
                vat: "80",
                fileUrl:
                  "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
                status: "pending",
                type: "Hôtel et logement",
                commentary: "séminaire billed",
                name: "encore",
                fileName: "preview-facture-free-201801-pdf-1.jpg",
                date: "204-VG-04",
                amount: 400,
                commentAdmin: "ok",
                email: "a@a",
                pct: 20,
              },
            ]);
          },
        };
        const storeCorruptMock = {
          bills() {
            return listCorruptMock;
          },
        };
        const getBillsToDisplay = new Bills({
          document,
          onNavigate,
          store: storeCorruptMock,
          localStorage: window.localStorage,
        });

        const arrBillsToDisplay = await getBillsToDisplay.getBills();
        const arrBillsStoredMock = await storeCorruptMock.bills().list();

        document.body.innerHTML = BillsUI({ data: arrBillsToDisplay });

        const dateInStore = arrBillsStoredMock[0].date;

        const firstBillDisplayed =
          screen.getByTestId("tbody").firstElementChild.innerHTML;

        expect(firstBillDisplayed).toMatch(new RegExp(`${dateInStore}`));
      });
    });
  });
});
