import pb from "lib/pocketbase";
import { useQuery } from "react-query";

var totalInterest = 0;
function calcInterest(principal) {
  const periodsPerYear = 12;
  const rate = process.env.REACT_APP_INTEREST_RATE;
  const interest =
    principal * Math.pow(1 + rate / 100 / periodsPerYear, periodsPerYear) -
    principal;
  return Math.round((interest * 100) / 100);
}
function localizeDate(date) {
  var targetTime = new Date(date);
  var tzDifference = targetTime.getTimezoneOffset();
  //convert the offset to milliseconds, add to targetTime, and make a new Date
  var localDate = new Date(targetTime.getTime() + tzDifference * 60 * 1000);
  return localDate;
}

export function useTransactions() {
  const id = pb.authStore.model?.id;

  async function getTransactions() {
    var lastCheckedRecordDate = 0;
    var runningTotal = 0;
    totalInterest = 0;

    function monthDiff(dateFrom, dateTo) {
      return (
        dateTo.getMonth() -
        dateFrom.getMonth() +
        12 * (dateTo.getFullYear() - dateFrom.getFullYear())
      );
    }

    function checkDate(record, index, recordArray) {
      const recordDate = new Date(record.date);

      // if first run or zero balance set the lastChecked First
      // avoids calculating a zero balance
      if (runningTotal === 0) {
        lastCheckedRecordDate = recordDate;
      }

      // if a month has passed calc the interest
      let monthDifference = monthDiff(lastCheckedRecordDate, recordDate);
      if (monthDifference) {
        //for loop checks for skipped months
        for (let i = 0; i < monthDifference; i++) {
          const interest = calcInterest(runningTotal);
          //make a copy of the record
          var interestRecord = JSON.parse(JSON.stringify(record));
          interestRecord.date = new Date(
            localizeDate(interestRecord.date)
          ).setDate(0);

          // adjust month to be correct per iteration
          interestRecord.date = new Date(interestRecord.date).setMonth(
            recordDate.getMonth() - monthDifference + i
          );
          // adjust year to previous record in case of year rollover.
          interestRecord.date = new Date(interestRecord.date).setFullYear(
            lastCheckedRecordDate.getFullYear()
          );
          interestRecord.description =
            "Interest Calculated on: $" + runningTotal / 100;
          //change running total after description but before adding it
          runningTotal += interest;
          totalInterest += interest;
          interestRecord.value = interest;
          interestRecord.type = "interest";
          interestRecord.id = interestRecord.date + "interest";
          recordArray.push(interestRecord);
        }
      }
      // add to running total after interest is potentially calculated
      if (record.credit) runningTotal += record.value;
      else runningTotal -= record.value;
      lastCheckedRecordDate = recordDate;
    }
    if (id !== undefined) {
      const userdata = await pb
        .collection("transactions")
        .getFullList(200, { sort: "date" });

      //append interestRecords to array then re-sort them
      userdata.forEach(checkDate);
      userdata.sort(function (a, b) {
        return new Date(a.date) - new Date(b.date);
      });
      return userdata;
    }
    return false;
  }
  return useQuery({ queryFn: getTransactions, queryKey: ["transactions", id] });
}

export default function ListTransactions(status, data, error) {
  let total = 0;
  function sumBalance(value, credit) {
    if (credit) total += value;
    else total -= value;
  }
  return (
    <>
    <div className="Section">
      <div className="Label">Transactions</div>
      <div className="sectionBody">
        {status === "loading" ? (
          "Loading..."
        ) : status === "error" ? (
          <span>Error: {error.message}</span>
        ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Value</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {data
                  .map((transaction) => (
                    <tr className={transaction.type} key={transaction.id}>
                      <td className="date">
                        {new Intl.DateTimeFormat("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "2-digit",
                        }).format(localizeDate(transaction.date))}
                      </td>
                      <td className="description">{transaction.description}</td>
                      <td
                        className={
                          transaction.credit ? "value credit" : "value debit"
                        }
                      >
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(transaction.value / 100)}
                        {sumBalance(transaction.value, transaction.credit)}
                      </td>
                      <td className="balance">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(total / 100)}
                      </td>
                    </tr>
                  ))
                  .reverse()}
              </tbody>
            </table>
        )}
        <div className="Interest">
          Interest:{" "}
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(totalInterest / 100)}
        </div>
      </div>
    </div>
    </>
  );
}
