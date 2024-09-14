"use client";

import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = "https://final-c1jc.onrender.com";

// Define types for each data structure
type User = {
  _id: string;
  name: string;
  email: string;
};

type Expense = {
  _id: string;
  userId: string;
  amount: number;
  categoryId: string;
  description: string;
  date: string;
};

type Category = {
  _id: string;
  name: string;
};

type Budget = {
  _id: string;
  userId: string;
  totalAmount: number;
  startDate: string;
  description: string;
  __v: number;
};

type ActiveTab = "users" | "expenses" | "categories" | "budgets";

type DataType = User | Expense | Category | Budget;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("users");
  const [users, setUsers] = useState<User[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [editingItem, setEditingItem] = useState<DataType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token) {
      router.push("/sign-in");
    } else {
      fetchUserData(token, userId!);
      fetchData();
    }
  }, [router]);

  const fetchUserData = async (token: string, user: string) => {
    try {
      const response = await axios.get<User>(`${API_BASE_URL}/users/${user}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserName(response.data.name);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to fetch user data. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    router.push("/sign-in");
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, expensesRes, categoriesRes, budgetsRes] =
        await Promise.all([
          axios.get<User[]>(`${API_BASE_URL}/users`),
          axios.get<Expense[]>(`${API_BASE_URL}/expense`),
          axios.get<Category[]>(`${API_BASE_URL}/category`),
          axios.get<Budget[]>(`${API_BASE_URL}/budget`),
        ]);

      setUsers(usersRes.data);
      setExpenses(expensesRes.data);
      setCategories(categoriesRes.data);
      setBudgets(budgetsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (newItem: Partial<DataType>) => {
    try {
      let response: AxiosResponse<DataType>;
      switch (activeTab) {
        case "users":
          response = await axios.post<User>(`${API_BASE_URL}/users`, newItem);
          setUsers([...users, response.data as User]);
          break;
        case "expenses":
          response = await axios.post<Expense>(
            `${API_BASE_URL}/expense`,
            newItem
          );
          setExpenses([...expenses, response.data as Expense]);
          break;
        case "categories":
          response = await axios.post<Category>(
            `${API_BASE_URL}/category`,
            newItem
          );
          setCategories([...categories, response.data as Category]);
          break;
        case "budgets":
          response = await axios.post<Budget>(
            `${API_BASE_URL}/budget`,
            newItem
          );
          setBudgets([...budgets, response.data as Budget]);
          break;
      }
      toast.success(`${activeTab.slice(0, -1)} added successfully!`);
      fetchData();
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error(`Failed to add ${activeTab.slice(0, -1)}. Please try again.`);
    }
  };

  const handleEdit = async (updatedItem: DataType) => {
    try {
      let response: AxiosResponse<DataType>;
      switch (activeTab) {
        case "users":
          response = await axios.put<User>(
            `${API_BASE_URL}/users/${updatedItem._id}`,
            updatedItem
          );
          setUsers(
            users.map((user) =>
              user._id === updatedItem._id ? (response.data as User) : user
            )
          );
          break;
        case "expenses":
          response = await axios.put<Expense>(
            `${API_BASE_URL}/expense/${updatedItem._id}`,
            updatedItem
          );
          setExpenses(
            expenses.map((expense) =>
              expense._id === updatedItem._id
                ? (response.data as Expense)
                : expense
            )
          );
          break;
        case "categories":
          response = await axios.put<Category>(
            `${API_BASE_URL}/category/${updatedItem._id}`,
            updatedItem
          );
          setCategories(
            categories.map((category) =>
              category._id === updatedItem._id
                ? (response.data as Category)
                : category
            )
          );
          break;
        case "budgets":
          response = await axios.put<Budget>(
            `${API_BASE_URL}/budget/${updatedItem._id}`,
            updatedItem
          );
          setBudgets(
            budgets.map((budget) =>
              budget._id === updatedItem._id
                ? (response.data as Budget)
                : budget
            )
          );
          break;
      }
      setEditingItem(null);
      toast.success(`${activeTab.slice(0, -1)} updated successfully!`);
      fetchData();
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error(
        `Failed to update ${activeTab.slice(0, -1)}. Please try again.`
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete this ${activeTab.slice(0, -1)}?`
      )
    ) {
      try {
        await axios.delete(`${API_BASE_URL}/${activeTab}/${id}`);
        switch (activeTab) {
          case "users":
            setUsers(users.filter((user) => user._id !== id));
            break;
          case "expenses":
            setExpenses(expenses.filter((expense) => expense._id !== id));
            break;
          case "categories":
            setCategories(categories.filter((category) => category._id !== id));
            break;
          case "budgets":
            setBudgets(budgets.filter((budget) => budget._id !== id));
            break;
        }
        toast.success(`${activeTab.slice(0, -1)} deleted successfully!`);
        fetchData();
      } catch (error) {
        console.error("Error deleting item:", error);
        toast.error(
          `Failed to delete ${activeTab.slice(0, -1)}. Please try again.`
        );
      }
    }
  };
  const renderForm = (
    item: Partial<User | Expense | Category | Budget> = {}
  ) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const newItem = Object.fromEntries(formData.entries());

      if ("_id" in item && item._id) {
        handleEdit({ ...newItem, _id: item._id } as
          | User
          | Expense
          | Category
          | Budget);
      } else {
        handleAdd(newItem);
      }
    };

    switch (activeTab) {
      case "users":
        return (
          <form onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={(item as Partial<User>).name || ""}
                required
              />
            </div>
            <div className="space-y-2 mt-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={(item as Partial<User>).email || ""}
                required
              />
            </div>
            <Button type="submit" className="mt-4">
              {"_id" in item ? "Update" : "Add"} User
            </Button>
          </form>
        );
      case "expenses":
        return (
          <form onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="userId">User</Label>
              <Select
                name="userId"
                defaultValue={(item as Partial<Expense>).userId || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 mt-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                defaultValue={(item as Partial<Expense>).amount || ""}
                required
              />
            </div>
            <div className="space-y-2 mt-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select
                name="categoryId"
                defaultValue={(item as Partial<Expense>).categoryId || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 mt-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                defaultValue={(item as Partial<Expense>).description || ""}
                required
              />
            </div>
            <div className="space-y-2 mt-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={
                  (item as Partial<Expense>).date
                    ? new Date((item as Expense).date)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                required
              />
            </div>
            <Button type="submit" className="mt-4">
              {"_id" in item ? "Update" : "Add"} Expense
            </Button>
          </form>
        );
      case "categories":
        return (
          <form onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={(item as Partial<Category>).name || ""}
                required
              />
            </div>
            <Button type="submit" className="mt-4">
              {"_id" in item ? "Update" : "Add"} Category
            </Button>
          </form>
        );
      case "budgets":
        return (
          <form onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="userId">User</Label>
              <Select
                name="userId"
                defaultValue={(item as Partial<Budget>).userId || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 mt-2">
              <Label htmlFor="totalAmount">Amount</Label>
              <Input
                id="totalAmount"
                name="totalAmount"
                type="number"
                step="0.01"
                defaultValue={(item as Partial<Budget>).totalAmount || ""}
                required
              />
            </div>
            <div className="space-y-2 mt-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                defaultValue={(item as Partial<Budget>).description || ""}
                required
              />
            </div>
            <div className="space-y-2 mt-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={
                  (item as Partial<Budget>).startDate
                    ? new Date((item as Budget).startDate)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                required
              />
            </div>
            <Button type="submit" className="mt-4">
              {"_id" in item ? "Update" : "Add"} Budget
            </Button>
          </form>
        );
    }
  };

  const renderTable = () => {
    const data = {
      users,
      expenses,
      categories,
      budgets,
    }[activeTab];

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!data || data.length === 0) {
      return <div>No data available.</div>;
    }

    const columns = {
      users: ["Name", "Email"],
      expenses: ["User", "Amount", "Category", "Description", "Date"],
      categories: ["Name"],
      budgets: ["User", "Amount", "Description", "Start Date"],
    }[activeTab];

    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns?.map((column, index) => (
              <TableHead key={index}>{column}</TableHead>
            ))}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item._id}>
              {columns?.map((column, index) => (
                <TableCell key={index}>
                  {column === "User"
                    ? users.find(
                        (u) => u._id === (item as Expense | Budget).userId
                      )?.name
                    : column === "Amount"
                    ? `$${
                        "amount" in item
                          ? (item as Expense).amount
                          : (item as Budget).totalAmount
                      }`
                    : column === "Category" && activeTab === "expenses"
                    ? categories.find(
                        (c) => c._id === (item as Expense).categoryId
                      )?.name || "N/A"
                    : column === "Start Date"
                    ? new Date((item as Budget).startDate).toLocaleDateString()
                    : (item as any)[column.toLowerCase()]}
                </TableCell>
              ))}
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingItem(item)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="ml-2"
                  onClick={() => handleDelete(item._id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Expense Tracker Admin</h1>
        <div className="flex items-center space-x-4">
          <span>Welcome, {userName}</span>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as ActiveTab)}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
        </TabsList>

        {["users", "expenses", "categories", "budgets"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Add New</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                      <DialogHeader>
                        <DialogTitle>Add New {tab.slice(0, -1)}</DialogTitle>
                      </DialogHeader>
                      {renderForm()}
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>{renderTable()}</CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Edit {activeTab.slice(0, -1)}</DialogTitle>
            </DialogHeader>
            {renderForm(editingItem)}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
