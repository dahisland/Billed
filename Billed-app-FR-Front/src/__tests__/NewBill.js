/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent, getByTestId } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import store from "../app/Store.js";
import { mockStore } from "../__mocks__/store.js";
import router from "../app/Router.js";
import "@testing-library/jest-dom";

describe("Given I am connected as an employee", () => {
  // [UNIT TEST] - Icon mail highlighting (MM)
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

// [INTEGRATION TEST] - Test API POST for create new bill (MM)
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

  // [UNIT TEST] - Valid proof uploaded (MM)
  describe("When I load an accepted file proof", () => {
    test("Then proof should be stored", async () => {
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

  // [UNIT TEST] - Unvalid proof uploaded (MM)
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

  // [UNIT TEST] - Valid proof uploaded to replace unvalid proof uploaded (MM)
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

  // [UNIT TEST] - Submit form with valid values (MM)
  describe("When I submit my form with valid values", () => {
    test("Then data should be stored and I should return on Bills page", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const inputName = screen.getByTestId("expense-name");
      fireEvent.change(inputName, { target: { value: "Achat ordinateur" } });
      const inputAmount = screen.getByTestId("amount");
      fireEvent.change(inputAmount, { target: { value: "250" } });
      const inputDate = screen.getByTestId("datepicker");
      fireEvent.change(inputDate, { target: { value: new Date() } });
      const inputPct = screen.getByTestId("pct");
      fireEvent.change(inputPct, { target: { value: "30" } });
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

      const rows = await screen.getByTestId("tbody");

      expect(submitNewBill).toHaveBeenCalled();
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
      // Test if a new bill has been created
      expect(rows.childNodes.length).toBe(1);
    });
  });
  // [UNIT TEST] - Submit form with unvalid values (MM)
  describe("When I submit my form with unvalid values", () => {
    test("Then I should stay on NewBill page", async () => {
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

      expect(screen.getByText("Fichier non valide")).toBeTruthy();

      const submitNewBill = jest.fn(newBill.handleSubmit);
      const form = screen.getByTestId("form-new-bill");

      form.addEventListener("submit", submitNewBill);
      fireEvent.submit(form);

      expect(submitNewBill).toHaveBeenCalled();
      expect(document.body.innerHTML).not.toContain("Mes note de frais");
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
  });

  // [UNIT TEST] - Submit form with no store (MM)
  describe("When I submit my form when there is no store", () => {
    test("Then I should not navigate on Bills page", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const submitNewBill = jest.fn(newBill.handleSubmit);
      const form = screen.getByTestId("form-new-bill");

      form.addEventListener("submit", submitNewBill);
      fireEvent.submit(form);

      expect(submitNewBill).toHaveBeenCalled();
      expect(document.body.innerHTML).not.toContain("Mes note de frais");
    });
  });
  // [UNIT TEST] - Error API on submit when bill storage is created (MM)
  describe("When an error occurres with API on submit", () => {
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

      jest.spyOn(mockStore, "bills");
      jest.spyOn(console, "error");

      const submit = jest.fn(newBill.handleSubmit);
      store.bills.mockImplementation(() => {
        return {
          create: (bill) => {
            return Promise.reject(new Error("Erreur"));
          },
        };
      });

      form.addEventListener("submit", submit);
      fireEvent.submit(form);

      await new Promise(process.nextTick);

      expect(console.error).toHaveBeenCalledWith(new Error("Erreur"));
      expect(console.error).toHaveBeenCalledTimes(2);
    });
  });
});

// [UNIT TESTS] - Errors 404 & 500 for API (MM)
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

  // [UNIT TEST] - Error 404 on submit when bill storage is created (MM)
  describe("When an error 404 occurres on submit", () => {
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

      jest.spyOn(mockStore, "bills");
      jest.spyOn(console, "error");

      const submit = jest.fn(newBill.handleSubmit);
      store.bills.mockImplementation(() => {
        return {
          create: (bill) => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });

      form.addEventListener("submit", submit);
      fireEvent.submit(form);

      await new Promise(process.nextTick);

      expect(console.error).toHaveBeenCalledWith(new Error("Erreur 404"));
    });
  });

  // [UNIT TEST] - Error 500 on submit when bill storage is created (MM)
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

      jest.spyOn(mockStore, "bills");
      jest.spyOn(console, "error");

      const submit = jest.fn(newBill.handleSubmit);
      store.bills.mockImplementation(() => {
        return {
          create: (bill) => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });

      form.addEventListener("submit", submit);
      fireEvent.submit(form);

      await new Promise(process.nextTick);

      expect(console.error).toHaveBeenCalledWith(new Error("Erreur 500"));
    });
  });
});
