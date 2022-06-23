/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import store from "../app/Store.js";
import { formatDate, formatStatus } from "../app/format";
import { mockStore, mockCorruptedStore } from "../__mocks__/store.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

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
      //[UNIT TEST COMPLETION - Add expect] - Control if class is added for icon (MM)
      expect(windowIcon.getAttribute("class")).toMatch(
        new RegExp("active-icon")
      );
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
    // [UNIT TEST] - Function "add new bill" (MM)
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
    // [UNIT TEST] - Function "Display proof" (MM)
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
  });
});

// [INTEGRATION TEST] - Test API GET for data to fetch (MM)
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate on bill page", () => {
    test("Then bills should be fetched from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      // Use mock store to verify if data is fetched
      const store = mockStore;
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      const contentBills = await screen.getByTestId("tbody");
      // Select in the store a data that should have been fetched & displayed
      const arrBillsStoredMock = await store.bills().list();
      const typeFirstBill = arrBillsStoredMock[0].type;

      // Rows must have been created & displayed with data fetched
      expect(contentBills.innerHTML).not.toBe("");
      expect(contentBills.children.length).toEqual(arrBillsStoredMock.length);
      expect(contentBills.innerHTML).toMatch(typeFirstBill);
    });
    // [UNIT TEST] - Test with corrupted/uncorrupted dates (MM)
    describe("When bills have been fetched from mock API GET", () => {
      test("Then if date isn't corrupted, bills should be displayed with date formatted & status", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const getBillsToDisplay = new Bills({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });
        const arrBillsToDisplay = await getBillsToDisplay.getBills();
        const arrBillsStoredMock = await mockStore.bills().list();
        document.body.innerHTML = BillsUI({ data: arrBillsToDisplay });
        const dateInStore = formatDate(arrBillsStoredMock[0].date);
        const statusInStore = formatStatus(arrBillsStoredMock[0].status);
        const firstBillDisplayed =
          screen.getByTestId("tbody").firstElementChild.innerHTML;

        expect(firstBillDisplayed).toMatch(new RegExp(`${dateInStore}`));
        expect(firstBillDisplayed).toMatch(new RegExp(`${statusInStore}`));
      });
      test("Then if date is corrupted, bills should be displayed with date not formatted", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const getBillsToDisplay = new Bills({
          document,
          onNavigate,
          store: mockCorruptedStore,
          localStorage: window.localStorage,
        });

        const arrBillsToDisplay = await getBillsToDisplay.getBills();
        const arrBillsStoredMock = await mockCorruptedStore.bills().list();

        document.body.innerHTML = BillsUI({ data: arrBillsToDisplay });

        const dateInStore = arrBillsStoredMock[0].date;

        const firstBillDisplayed =
          screen.getByTestId("tbody").firstElementChild.innerHTML;

        expect(firstBillDisplayed).toMatch(new RegExp(`${dateInStore}`));
      });
    });
    // [UNIT TEST] - Errors 404 & 500 for API (MM)
    describe("When an error occurs by fetching bills with API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      test("Then if fetch bills fails with 404 message error, It should display 404 error message", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        document.body.innerHTML = BillsUI({ error: "Erreur 404" });
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });
      test("Then if fetch bills fails with 500 message error, It should display 500 error message", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        document.body.innerHTML = BillsUI({ error: "Erreur 500" });
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
    //
  });
});
