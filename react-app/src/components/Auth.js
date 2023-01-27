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
      date: data.date,
    });
    createReset();
  }

  if (isLoggedIn)
    return (
      <>
        <div>
          <h1>Logged In: {pb.authStore.model.email}</h1>
          <p>Verified: {isVerified ? "True" : "False"}</p>
          {!isVerified && (
            <button onClick={requestVerification}>
              Send Verification Email
            </button>
          )}
          <button onClick={logout}>Log Out</button>
        </div>
        <div className="Section">
          <div className="Label">Add Transaction</div>
          <div className="sectionBody">
            <form onSubmit={handleCreate(createTransaction)}>
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
                type="date"
                defaultValue={new Date().toLocaleDateString("en-CA")}
                {...createRegister("date")}
              />
              <button type="submit" disabled={isLoading}>
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
