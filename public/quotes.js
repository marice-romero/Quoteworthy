async function buildQuotesTable(
  quotesTable,
  quotesTableHeader,
  token,
  message
) {
  try {
    const response = await fetch("/api/v1/quotes", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    var children = [quotesTableHeader];
    if (response.status === 200) {
      if (data.count === 0) {
        quotesTable.replaceChildren(...children); // clear this for safety
        return 0;
      } else {
        for (let i = 0; i < data.quotes.length; i++) {
          let editButton = `<td><button type="button" class="editButton" data-id=${data.quotes[i]._id}>edit</button></td>`;
          let deleteButton = `<td><button type="button" class="deleteButton" data-id=${data.quotes[i]._id}>delete</button></td>`;
          let rowHTML = `<td>${data.quotes[i].quoteText}</td><td>${data.quotes[i].source}</td><td>${data.quotes[i].sourceType}</td>${editButton}${deleteButton}`;
          let rowEntry = document.createElement("tr");
          rowEntry.innerHTML = rowHTML;
          children.push(rowEntry);
        }
        quotesTable.replaceChildren(...children);
      }
      return data.count;
    } else {
      message.textContent = data.msg;
      return 0;
    }
  } catch (err) {
    message.textContent = "A communication error occurred.";
    return 0;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const logoff = document.getElementById("logoff");
  const message = document.getElementById("message");
  const logonRegister = document.getElementById("logon-register");
  const logon = document.getElementById("logon");
  const register = document.getElementById("register");
  const logonDiv = document.getElementById("logon-div");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const logonButton = document.getElementById("logon-button");
  const logonCancel = document.getElementById("logon-cancel");
  const registerDiv = document.getElementById("register-div");
  const username = document.getElementById("username");
  const email1 = document.getElementById("email1");
  const password1 = document.getElementById("password1");
  const password2 = document.getElementById("password2");
  const registerButton = document.getElementById("register-button");
  const registerCancel = document.getElementById("register-cancel");
  const quotes = document.getElementById("quotes");
  const quotesTable = document.getElementById("quotes-table");
  const quotesTableHeader = document.getElementById("quotes-table-header");
  const addQuote = document.getElementById("add-quote");
  const editQuote = document.getElementById("edit-quote");
  const quoteText = document.getElementById("quote-text");
  const source = document.getElementById("source");
  const sourceType = document.getElementById("source-type");
  const addingQuote = document.getElementById("adding-quote");
  const quotesMessage = document.getElementById("quotes-message");
  const editCancel = document.getElementById("edit-cancel");

  // section 2
  let showing = logonRegister;
  let token = null;
  document.addEventListener("startDisplay", async () => {
    showing = logonRegister;
    token = localStorage.getItem("token");
    if (token) {
      //if the user is logged in
      logoff.style.display = "block";
      const count = await buildQuotesTable(
        quotesTable,
        quotesTableHeader,
        token,
        message
      );
      if (count > 0) {
        quotesMessage.textContent = "";
        quotesTable.style.display = "block";
      } else {
        quotesMessage.textContent =
          "There are no quotes to display for this user.";
        quotesTable.style.display = "none";
      }
      quotes.style.display = "block";
      showing = quotes;
    } else {
      logonRegister.style.display = "block";
    }
  });

  var thisEvent = new Event("startDisplay");
  document.dispatchEvent(thisEvent);
  var suspendInput = false;

  // section 3
  document.addEventListener("click", async (e) => {
    if (suspendInput) {
      return; // we don't want to act on buttons while doing async operations
    }
    if (e.target.nodeName === "BUTTON") {
      message.textContent = "";
    }
    if (e.target === logoff) {
      localStorage.removeItem("token");
      token = null;
      showing.style.display = "none";
      logonRegister.style.display = "block";
      showing = logonRegister;
      quotesTable.replaceChildren(quotesTableHeader); // don't want other users to see
      message.textContent = "You are logged off.";
    } else if (e.target === logon) {
      showing.style.display = "none";
      logonDiv.style.display = "block";
      showing = logonDiv;
    } else if (e.target === register) {
      showing.style.display = "none";
      registerDiv.style.display = "block";
      showing = registerDiv;
    } else if (e.target === logonCancel || e.target == registerCancel) {
      showing.style.display = "none";
      logonRegister.style.display = "block";
      showing = logonRegister;
      email.value = "";
      password.value = "";
      username.value = "";
      email1.value = "";
      password1.value = "";
      password2.value = "";
    } else if (e.target === logonButton) {
      suspendInput = true;
      try {
        const response = await fetch("/api/v1/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.value,
            password: password.value,
          }),
        });
        const data = await response.json();
        if (response.status === 200) {
          message.textContent = `Logon successful.  Welcome ${data.user.username}`;
          token = data.token;
          localStorage.setItem("token", token);
          showing.style.display = "none";
          thisEvent = new Event("startDisplay");
          email.value = "";
          password.value = "";
          document.dispatchEvent(thisEvent);
        } else {
          message.textContent = data.msg;
        }
      } catch (err) {
        message.textContent = "A communications error occurred.";
      }
      suspendInput = false;
    } else if (e.target === registerButton) {
      if (password1.value != password2.value) {
        message.textContent = "The passwords entered do not match.";
      } else {
        suspendInput = true;
        try {
          const response = await fetch("/api/v1/auth/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: username.value,
              email: email1.value,
              password: password1.value,
            }),
          });
          const data = await response.json();
          if (response.status === 201) {
            message.textContent = `Registration successful.  Welcome ${data.user.username}`;
            token = data.token;
            localStorage.setItem("token", token);
            showing.style.display = "none";
            thisEvent = new Event("startDisplay");
            document.dispatchEvent(thisEvent);
            username.value = "";
            email1.value = "";
            password1.value = "";
            password2.value = "";
          } else {
            message.textContent = data.msg;
          }
        } catch (err) {
          message.textContent = "A communications error occurred.";
        }
        suspendInput = false;
      }
    } // section 4
    else if (e.target === addQuote) {
      showing.style.display = "none";
      editQuote.style.display = "block";
      showing = editQuote;
      delete editQuote.dataset.id;
      quoteText.value = "";
      source.value = "";
      sourceType.value = "choose a source type";
      addingQuote.textContent = "add";
    } else if (e.target === editCancel) {
      showing.style.display = "none";
      quoteText.value = "";
      source.value = "";
      sourceType.value = "choose a source type";
      thisEvent = new Event("startDisplay");
      document.dispatchEvent(thisEvent);
    } else if (e.target === addingQuote) {
      if (!editQuote.dataset.id) {
        // this is an attempted add
        suspendInput = true;
        try {
          const response = await fetch("/api/v1/quotes", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              quoteText: quoteText.value,
              source: source.value,
              sourceType: sourceType.value,
            }),
          });
          const data = await response.json();
          if (response.status === 201) {
            //successful create
            message.textContent = "Success! You've added a quote.";
            showing.style.display = "none";
            thisEvent = new Event("startDisplay");
            document.dispatchEvent(thisEvent);
            quoteText.value = "";
            source.value = "";
            sourceType.value = "choose a source type";
          } else {
            // failure
            message.textContent = data.msg;
          }
        } catch (err) {
          message.textContent = "A communication error occurred.";
        }
        suspendInput = false;
      } else {
        // this is an update
        suspendInput = true;
        try {
          const quoteID = editQuote.dataset.id;
          const response = await fetch(`/api/v1/quotes/${quoteID}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              quoteText: quoteText.value,
              source: source.value,
              sourceType: sourceType.value,
            }),
          });
          const data = await response.json();
          if (response.status === 200) {
            message.textContent = "The quote was updated.";
            showing.style.display = "none";
            quoteText.value = "";
            source.value = "";
            sourceType.value = "choose a source type";
            thisEvent = new Event("startDisplay");
            document.dispatchEvent(thisEvent);
          } else {
            message.textContent = data.msg;
          }
        } catch (err) {
          message.textContent = "A communication error occurred.";
        }
      }
      suspendInput = false;
    } // section 5
    else if (e.target.classList.contains("editButton")) {
      editQuote.dataset.id = e.target.dataset.id;
      suspendInput = true;
      try {
        const response = await fetch(`/api/v1/quotes/${e.target.dataset.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.status === 200) {
          quoteText.value = data.quote.quoteText;
          source.value = data.quote.source;
          sourceType.value = data.quote.sourceType;
          showing.style.display = "none";
          showing = editQuote;
          showing.style.display = "block";
          addingJob.textContent = "update";
          message.textContent = "";
        } else {
          // might happen if the list has been updated since last display
          message.textContent = "The quote was not found";
          thisEvent = new Event("startDisplay");
          document.dispatchEvent(thisEvent);
        }
      } catch (err) {
        message.textContent = "A communications error has occurred.";
      }
      suspendInput = false;
    } // delete attempt
    else if (e.target.classList.contains("deleteButton")) {
      suspendInput = true;
      try {
        const quoteID = e.target.dataset.id;
        const response = await fetch(`/api/v1/quotes/${quoteID}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.status === 200) {
          message.textContent = "The quote was deleted.";
          showing.style.display = "none";
          quoteText.value = "";
          source.value = "";
          sourceType.value = "choose a source type";
          thisEvent = new Event("startDisplay");
          document.dispatchEvent(thisEvent);
        } else {
          message.textContent = data.msg;
        }
      } catch (err) {
        message.textContent = "A communication error occurred.";
      }
      suspendInput = false;
    }
  });
});
