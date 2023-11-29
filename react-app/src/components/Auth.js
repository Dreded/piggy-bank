import useLogout from "hooks/useLogout";
import useLogin from "hooks/useLogin";
import useCreateTransaction from "hooks/useCreateTransaction";
import ListTransactions, { useTransactions } from "components/Transactions";
import pb from "lib/pocketbase";
import { useForm } from "react-hook-form";
import useVerified, { requestVerification } from "hooks/useVerified";

export default function Auth() {
  const logout = useLogout();
  const { data: isVerified } = useVerified();
  const { mutate: login, isLoading, isError } = useLogin();
  const { register, handleSubmit, reset } = useForm();
  const { mutate: create } = useCreateTransaction();
  const { status: transactionStatus, data: transactionData, error: transactionError } = useTransactions();
  const {
    register: createRegister,
    handleSubmit: handleCreate,
    reset: createReset,
  } = useForm();
  const isLoggedIn = pb.authStore.isValid;

  async function onSubmit(data) {
    login({ email: data.email, password: data.password });
    reset();
  }
  function createTransaction(data) {
    create({
      description: data.description,
      ammount: data.ammount,
      debit: data.debit,
      date: data.date,
      multi: data.multi,
      date_start: data.date_start,
      date_end: data.date_end,
    });
    createReset();
  }

  if (isLoggedIn)
    return (
      <>
        <div>
          <button className="button-1" onClick={logout}>Log Out</button>
          <h1><span>{pb.authStore.model.name}'s</span> <span>Piggy Bank</span></h1>
          <p>{isVerified ? "" : "Verified: False"}</p>
          {!isVerified && (
            <button onClick={requestVerification}>
              Send Verification Email
            </button>
          )}
        </div>
        <div className="Section">
          <div className="Label">Add Transaction</div>
          <div className="sectionBody">
            <form className="myForm" onSubmit={handleCreate(createTransaction)}>
              <input
                type="text"
                placeholder="description"
                {...createRegister("description")}
              />
              <input
                type="number"
                placeholder="ammount"
                {...createRegister("ammount")}
              />
              <input
                type="checkbox"
                placeholder="debit"
                {...createRegister("debit")}
              /><span class="debit">Debit?</span>
              <input
                type="date"
                defaultValue={new Date().toLocaleDateString("en-CA")}
                {...createRegister("date")}
              />
              <br />
          {/* <div className="SubLabel">
          Multi-Add?: <input class="checkbox-inline" type="checkbox" name="multi"
          {...createRegister("multi")}
          />
          </div> */}
           Weekly-Add:<input class="checkbox-inline" type="checkbox" name="multi"
           {...createRegister("multi")}
           />
           &nbsp;&nbsp;Start: 
              <input
                type="date"
                defaultValue={new Date().toLocaleDateString("en-CA")}
                {...createRegister("date_start")}
              />
              &nbsp;&nbsp;End: <input
              type="date"
              defaultValue={new Date().toLocaleDateString("en-CA")}
              {...createRegister("date_end")}
            />
              <button className="button-1" type="submit" disabled={isLoading}>
                {isLoading ? "Loading" : "Add"}
              </button>
            </form>
          </div>
        </div>
        {ListTransactions(transactionStatus, transactionData, transactionError)}

      </>
    );
  return (
    <>
      {isLoading && <p>Loading... </p>}
      {isError && <p style={{ color: "Red" }}>Invalid email or password.</p>}
      <h1>Please Log In...</h1>
      {process.env.REACT_APP_PB_URL}

      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="text" placeholder="email" {...register("email")} />
        <input
          type="password"
          placeholder="password"
          {...register("password")}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Loading" : "Login"}
        </button>
      </form>
    </>
  );
}
