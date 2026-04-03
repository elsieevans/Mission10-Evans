// table for displaying all of the bowler info the assignment asks for
function BowlerTable({ bowlers }) {
  return (
    <table className="bowler-table">
      <thead>
        <tr>
          <th>Bowler Name</th>
          <th>Team Name</th>
          <th>Address</th>
          <th>City</th>
          <th>State</th>
          <th>Zip</th>
          <th>Phone Number</th>
        </tr>
      </thead>
      <tbody>
        {bowlers.map((b, index) => (
          <tr key={index}>
            <td>
              {b.firstName} {b.middleInit && b.middleInit + " "}
              {b.lastName}
            </td>
            <td>{b.teamName}</td>
            <td>{b.address}</td>
            <td>{b.city}</td>
            <td>{b.state}</td>
            <td>{b.zip}</td>
            <td>{b.phoneNumber}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default BowlerTable;

