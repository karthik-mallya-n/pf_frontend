"use client";
import { useState, useEffect, useCallback } from "react";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement
);

interface Transaction {
  t_id: number;
  type: string;
  amount: number;
  category: string;
  note?: string;
  date: string;
}

type MonthlyData = {
  [month: string]: {
    income: number;
    expense: number;
  };
};

type CategoryData = {
  [category: string]: number;
};

// Define month names array - moved outside the component to be used in multiple places
const monthNames = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export default function FinancialCharts({ transactions }: { transactions: Transaction[] }) {
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({});
  const [expenseCategories, setExpenseCategories] = useState<CategoryData>({});
  const [incomeCategories, setIncomeCategories] = useState<CategoryData>({});
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

  const processTransactions = useCallback(() => {    const monthlyDataTemp: MonthlyData = {};
    const expenseCategoriesTemp: CategoryData = {};
    const incomeCategoriesTemp: CategoryData = {};

    transactions.forEach(transaction => {
      // Parse the date
      const date = new Date(transaction.date);
      const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      
      // Initialize month data if it doesn't exist
      if (!monthlyDataTemp[monthYear]) {
        monthlyDataTemp[monthYear] = { income: 0, expense: 0 };
      }
      
      // Add transaction amount to the appropriate type
      if (transaction.type === "income") {
        monthlyDataTemp[monthYear].income += transaction.amount;
        
        // Update income categories
        incomeCategoriesTemp[transaction.category] = 
          (incomeCategoriesTemp[transaction.category] || 0) + transaction.amount;
      } else {
        monthlyDataTemp[monthYear].expense += transaction.amount;
        
        // Update expense categories
        expenseCategoriesTemp[transaction.category] = 
          (expenseCategoriesTemp[transaction.category] || 0) + transaction.amount;
      }
    });

    // Sort months chronologically
    const sortedMonthlyData: MonthlyData = {};
    Object.keys(monthlyDataTemp)
      .sort((a, b) => {
        const [aMonth, aYear] = a.split(' ');
        const [bMonth, bYear] = b.split(' ');
        
        if (aYear !== bYear) {
          return parseInt(aYear) - parseInt(bYear);
        }
        
        return monthNames.indexOf(aMonth) - monthNames.indexOf(bMonth);
      })
      .forEach(key => {
        sortedMonthlyData[key] = monthlyDataTemp[key];
      });
      // Set the monthly data
    setMonthlyData(sortedMonthlyData);
    setExpenseCategories(expenseCategoriesTemp);
    setIncomeCategories(incomeCategoriesTemp);
    
    // Update the available months
    setAvailableMonths(Object.keys(sortedMonthlyData));
  }, [transactions]);

  useEffect(() => {
    processTransactions();
  }, [processTransactions]);

  // Random color generator
  const generateColors = (count: number) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(`hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`);
    }
    return colors;
  };
  // Filter transactions based on selected month
  const getFilteredTransactions = () => {
    if (selectedMonth === "all") {
      return transactions;
    }
    
    return transactions.filter(transaction => {
      const date = new Date(transaction.date);
      const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      return monthYear === selectedMonth;
    });
  };
  
  // Process category data for the selected month
  const getFilteredCategoryData = () => {
    const filteredTransactions = getFilteredTransactions();
    const expenseCategoriesData: CategoryData = {};
    const incomeCategoriesData: CategoryData = {};
    
    filteredTransactions.forEach(transaction => {
      if (transaction.type === "income") {
        incomeCategoriesData[transaction.category] = 
          (incomeCategoriesData[transaction.category] || 0) + transaction.amount;
      } else {
        expenseCategoriesData[transaction.category] = 
          (expenseCategoriesData[transaction.category] || 0) + transaction.amount;
      }
    });
    
    return { expenseCategoriesData, incomeCategoriesData };
  };
  
  const { expenseCategoriesData, incomeCategoriesData } = getFilteredCategoryData();
    // Monthly income/expense chart data
  const monthlyChartData = {
    labels: selectedMonth === "all" 
      ? Object.keys(monthlyData)
      : [selectedMonth],
    datasets: [
      {
        label: 'Income',
        data: selectedMonth === "all"
          ? Object.values(monthlyData).map(data => data.income)
          : [monthlyData[selectedMonth]?.income || 0],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      },
      {
        label: 'Expense',
        data: selectedMonth === "all"
          ? Object.values(monthlyData).map(data => data.expense)
          : [monthlyData[selectedMonth]?.expense || 0],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
      }
    ],
  };
    // Monthly balance line chart
  const monthlyBalanceData = {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: 'Monthly Balance',
        data: Object.values(monthlyData).map(data => data.income - data.expense),
        fill: false,
        backgroundColor: 'rgb(54, 162, 235)',
        borderColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.1
      }
    ],
  };
    // Expense categories pie chart
  const expensePieData = {
    labels: Object.keys(selectedMonth === "all" ? expenseCategories : expenseCategoriesData),
    datasets: [
      {
        label: 'Expenses by Category',
        data: Object.values(selectedMonth === "all" ? expenseCategories : expenseCategoriesData),
        backgroundColor: generateColors(
          Object.keys(selectedMonth === "all" ? expenseCategories : expenseCategoriesData).length
        ),
        borderWidth: 1,
      },
    ],
  };
  
  // Income categories pie chart
  const incomePieData = {
    labels: Object.keys(selectedMonth === "all" ? incomeCategories : incomeCategoriesData),
    datasets: [
      {
        label: 'Income by Category',
        data: Object.values(selectedMonth === "all" ? incomeCategories : incomeCategoriesData),
        backgroundColor: generateColors(
          Object.keys(selectedMonth === "all" ? incomeCategories : incomeCategoriesData).length
        ),
        borderWidth: 1,
      },
    ],
  };  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: selectedMonth === "all" 
          ? 'Monthly Income and Expenses' 
          : `Income and Expenses for ${selectedMonth}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
      x: {
        grid: {
          display: selectedMonth !== "all"
        }
      }
    },
    // Increase bar width when only showing one month
    barPercentage: selectedMonth !== "all" ? 0.5 : 0.8,
    categoryPercentage: selectedMonth !== "all" ? 0.8 : 0.9,
  };
  
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: selectedMonth === "all" 
          ? 'Monthly Balance Trend' 
          : `Balance for ${selectedMonth}`,
      },
    },
  };
  
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  // If there's no data yet, show a loading state
  if (Object.keys(monthlyData).length === 0) {
    return <div className="text-center my-6">No transaction data available for charts</div>;
  }

  // Calculate the totals based on filtered data
  const getFilteredTotals = () => {
    const filteredTransactions = getFilteredTransactions();
    const totalIncome = filteredTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpense = filteredTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
      
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
  };
  
  const { totalIncome, totalExpense, balance } = getFilteredTotals();
  return (
    <div className="space-y-10 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-700">Financial Visualizations</h2>
        
        <div className="flex items-center">
          <label htmlFor="month-select" className="mr-2 text-gray-600">Filter by month:</label>
          <select 
            id="month-select" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Months</option>
            {availableMonths.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
      </div>      {/* Summary Cards for Selected Month */}
      {selectedMonth !== "all" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-gray-500 mb-1">Income for</div>
            <div className="text-lg font-medium text-gray-700 mb-2">{selectedMonth}</div>
            <div className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-gray-500 mb-1">Expenses for</div>
            <div className="text-lg font-medium text-gray-700 mb-2">{selectedMonth}</div>
            <div className="text-2xl font-bold text-red-600">${totalExpense.toFixed(2)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-gray-500 mb-1">Balance for</div>
            <div className="text-lg font-medium text-gray-700 mb-2">{selectedMonth}</div>
            <div className="text-2xl font-bold text-blue-600">${balance.toFixed(2)}</div>
          </div>
        </div>
      )}{/* Show both charts if viewing all months, otherwise just show bar chart with special styling */}
      <div className={`bg-white rounded-lg shadow p-6 ${selectedMonth !== "all" ? "border-2 border-blue-200" : ""}`}>
        <Bar data={monthlyChartData} options={barOptions} />
      </div>
      
      {selectedMonth === "all" && (
        <div className="bg-white rounded-lg shadow p-6">
          <Line data={monthlyBalanceData} options={lineOptions} />
        </div>
      )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            {selectedMonth === "all" ? "Expense Distribution" : `Expense Distribution for ${selectedMonth}`}
          </h3>
          <Pie data={expensePieData} options={pieOptions} />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            {selectedMonth === "all" ? "Income Sources" : `Income Sources for ${selectedMonth}`}
          </h3>
          <Pie data={incomePieData} options={pieOptions} />
        </div>
      </div>
    </div>
  );
}
