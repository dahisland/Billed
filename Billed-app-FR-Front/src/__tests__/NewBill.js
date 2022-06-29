/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent, getByTestId } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import store from "../app/Store.js";
import { mockStore } from "../__mocks__/store.js";
import router from "../app/Router.js";
import "@testing-library/jest-dom";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
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
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const windowMail = screen.getByTestId("icon-mail");
      expect(windowMail.getAttribute("class")).toMatch(
        new RegExp("active-icon")
      );
    });
  });
});
// [INTEGRATION TEST] - Test API POST for data to send (MM)
describe("Given I am on NewBill Page", () => {
  beforeEach(() => {
    const html = NewBillUI();
    document.body.innerHTML = html;

    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "jondoe@mail.com",
      })
    );
  });

  describe("When I load an accepted file proof", () => {
    test("Then proof should be accepted", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const inputFile = document.querySelector(`input[data-testid="file"]`);
      const onFileChange = jest.fn(newBill.handleChangeFile);

      const eventLoadFilePNG = {
        target: {
          files: [new File(["..."], "test.png", { type: "document/png" })],
        },
      };

      inputFile.addEventListener("change", onFileChange);
      fireEvent.change(inputFile, eventLoadFilePNG);

      expect(inputFile.files.length).toBe(1);
      expect(onFileChange).toHaveBeenCalled();
      expect(inputFile.files[0].name).toBe("test.png");
    });
  });
  describe("When I load a non accepted file proof", () => {
    test("Then an error message should be displayed", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const inputFile = document.querySelector(`input[data-testid="file"]`);
      const onFileChange = jest.fn(newBill.handleChangeFile);

      const eventLoadFilePDF = {
        target: {
          files: [new File(["..."], "test.pdf", { type: "document/pdf" })],
        },
      };
      inputFile.addEventListener("change", onFileChange);
      fireEvent.change(inputFile, eventLoadFilePDF);

      const fileNotAllowed = screen.getByText(`Fichier "test.pdf" non valide`);
      expect(fileNotAllowed).toBeTruthy();
    });
  });
  describe("When I change a non accepted file proof by an accepted file proof", () => {
    test("Then the error message should disappear", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const inputFile = document.querySelector(`input[data-testid="file"]`);
      const message = document.createElement("div");
      message.classList.add("error-message");
      message.innerHTML = `Fichier non valide`;
      inputFile.parentNode.appendChild(message);

      const onFileChange = jest.fn(newBill.handleChangeFile);

      const eventLoadFilePNG = {
        target: {
          files: [new File(["..."], "test.png", { type: "document/png" })],
        },
      };
      inputFile.addEventListener("change", onFileChange);
      fireEvent.change(inputFile, eventLoadFilePNG);

      expect(inputFile.parentNode.innerHTML).not.toMatch(
        new RegExp("Fichier non valide")
      );
    });
  });
  describe("When I submit my form with good values", () => {
    test("Then my form should be submitted and I should return on Bills page", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const inputFile = document.querySelector(`input[data-testid="file"]`);

      const eventLoadFilePNG = {
        target: {
          files: [new File(["..."], "test.png", { type: "document/png" })],
        },
      };
      fireEvent.change(inputFile, eventLoadFilePNG);

      const submitNewBill = jest.fn(newBill.handleSubmit);
      const form = screen.getByTestId("form-new-bill");

      form.addEventListener("submit", submitNewBill);
      fireEvent.submit(form);

      expect(submitNewBill).toHaveBeenCalled();
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    });
    // TESTS ERRORS
    describe("When an error 500 occurres on submit", () => {
      test("Then a warning should be displayed on console", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const store = mockStore;

        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });

        const form = screen.getByTestId("form-new-bill");
        const email = "a@a.fr";

        const bill = {
          email,
          type: "Equipements et materiel",
          name: "Achat ordinateur",
          amount: 900,
          date: "2020-04- 04",
          vat: "70",
          pct: 20,
          commentary: "S'il vous plait",
          fileUrl:
            "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
          fileName: "test.png",
          status: "pending",
        };

        jest.spyOn(mockStore, "bills");
        jest.spyOn(console, "error");

        const updatedStore = jest.fn(newBill.updateBill(bill));
        store.bills.mockImplementation(() => {
          return {
            update: (bill) => {
              return Promise.reject("Erreur 500");
            },
          };
        });

        form.addEventListener("submit", updatedStore);
        fireEvent.submit(form);

        await new Promise(process.nextTick);

        expect(console.error).toHaveBeenCalledWith("Erreur 500");
      });
    });
    describe("When an error 500 occurres on file upload", () => {
      test("Then a warning should be displayed on console", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const store = mockStore;

        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });

        jest.spyOn(mockStore, "bills");
        jest.spyOn(console, "error");

        store.bills.mockImplementation(() => {
          return {
            create: (bill) => {
              return Promise.reject("Erreur 500");
            },
          };
        });

        const inputFile = document.querySelector(`input[data-testid="file"]`);
        const onFileChange = jest.fn(newBill.handleChangeFile);
        const eventLoadFilePNG = {
          target: {
            files: [new File(["..."], "test.png", { type: "document/png" })],
          },
        };
        inputFile.addEventListener("change", onFileChange);
        fireEvent.change(inputFile, eventLoadFilePNG);

        await new Promise(process.nextTick);

        expect(console.error).toHaveBeenCalledWith("Erreur 500");
      });
    });
  });
});
