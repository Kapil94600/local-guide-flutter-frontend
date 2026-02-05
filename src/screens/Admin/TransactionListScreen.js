import React, { useEffect, useState, useMemo } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
} from "react-native";
import api from "../../api/apiClient";
import Papa from "papaparse";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const PER_PAGE = 10;

export default function TransactionListScreen() {
    const [allTransactions, setAllTransactions] = useState([]);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const getRevenueSummary = (transactions) => {
        const now = new Date();

        let today = 0;
        let month = 0;
        let total = 0;

        transactions.forEach(t => {
            if (t.paymentStatus !== "SUCCESS") return;

            const d = new Date(t.createdOn);
            const amt = Number(t.amount || 0);

            total += amt;

            // today
            if (
                d.getDate() === now.getDate() &&
                d.getMonth() === now.getMonth() &&
                d.getFullYear() === now.getFullYear()
            ) {
                today += amt;
            }

            // this month
            if (
                d.getMonth() === now.getMonth() &&
                d.getFullYear() === now.getFullYear()
            ) {
                month += amt;
            }
        });

        return { today, month, total };
    };

    useEffect(() => {
        fetchAllTransactions();
    }, []);

    const fetchAllTransactions = async () => {
        try {
            const res = await api.post("/transaction/get", {
                admin: true,
                page: 1,
                perPage: 1000, // 🔥 load all once
            });

            if (res.data.status) {
                setAllTransactions(res.data.data || []);
            }
        } catch (e) {
            console.log("TXN ERROR", e.response?.data || e.message);
        }
    };
    const revenue = useMemo(
        () => getRevenueSummary(allTransactions),
        [allTransactions]
    );


    // 🔎 FILTER + SEARCH
    const filteredTransactions = useMemo(() => {
        let data = allTransactions;

        if (statusFilter !== "ALL") {
            data = data.filter(t => t.paymentStatus === statusFilter);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            data = data.filter(t =>
                String(t.transactionId).toLowerCase().includes(q) ||
                (t.other || "").toLowerCase().includes(q) ||
                (t.paymentStatus || "").toLowerCase().includes(q)
            );
        }

        return data;
    }, [allTransactions, statusFilter, search]);

    // 📄 PAGINATION
    const paginatedData = useMemo(() => {
        const start = (page - 1) * PER_PAGE;
        return filteredTransactions.slice(start, start + PER_PAGE);
    }, [filteredTransactions, page]);

    const totalPages = Math.ceil(filteredTransactions.length / PER_PAGE) || 1;

    // ⬇️ CSV DOWNLOAD
    const downloadCSV = async () => {
        if (!filteredTransactions.length) return;

        const csv = Papa.unparse(
            filteredTransactions.map(t => ({
                Transaction_ID: t.transactionId,
                User: t.other || "",
                Amount: t.amount,
                Status: t.paymentStatus,
                Date: t.createdOn,
            }))
        );

        const fileUri = FileSystem.documentDirectory + "transactions.csv";
        await FileSystem.writeAsStringAsync(fileUri, csv, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        await Sharing.shareAsync(fileUri);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.amount}>₹ {item.amount}</Text>
            <Text>Txn ID: {item.transactionId}</Text>
            <Text>User: {item.other || "-"}</Text>
            <Text>Status: {item.paymentStatus}</Text>
            <Text>Date: {item.createdOn}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Transactions</Text>

            {/* 🔎 SEARCH */}
            <TextInput
                placeholder="Search by Txn ID / User / Status"
                value={search}
                onChangeText={(t) => {
                    setSearch(t);
                    setPage(1);
                }}
                style={styles.search}
            />
            <View style={styles.summaryRow}>
                <View style={[styles.summaryCard, { backgroundColor: "#4CAF50" }]}>
                    <Text style={styles.summaryLabel}>Today</Text>
                    <Text style={styles.summaryValue}>₹ {revenue.today.toFixed(2)}</Text>
                </View>

                <View style={[styles.summaryCard, { backgroundColor: "#2196F3" }]}>
                    <Text style={styles.summaryLabel}>This Month</Text>
                    <Text style={styles.summaryValue}>₹ {revenue.month.toFixed(2)}</Text>
                </View>

                <View style={[styles.summaryCard, { backgroundColor: "#9C27B0" }]}>
                    <Text style={styles.summaryLabel}>Total</Text>
                    <Text style={styles.summaryValue}>₹ {revenue.total.toFixed(2)}</Text>
                </View>
            </View>


            {/* ⬇️ DOWNLOAD BUTTON */}
            <TouchableOpacity style={styles.downloadBtn} onPress={downloadCSV}>
                <Text style={styles.downloadText}>⬇️ Download CSV</Text>
            </TouchableOpacity>

            {/* STATUS FILTER */}
            <View style={styles.filters}>
                {["ALL", "SUCCESS", "PENDING", "FAILED"].map(s => (
                    <TouchableOpacity
                        key={s}
                        style={[
                            styles.filterBtn,
                            statusFilter === s && styles.active,
                        ]}
                        onPress={() => {
                            setStatusFilter(s);
                            setPage(1);
                        }}
                    >
                        <Text style={styles.filterTxt}>{s}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* LIST */}
            <FlatList
                data={paginatedData}
                keyExtractor={(i) => i.id.toString()}
                renderItem={renderItem}
            />

            {/* PAGINATION */}
            <View style={styles.pager}>
                <TouchableOpacity
                    disabled={page === 1}
                    onPress={() => setPage(page - 1)}
                >
                    <Text style={styles.pageBtn}>◀ Prev</Text>
                </TouchableOpacity>

                <Text>
                    Page {page} / {totalPages}
                </Text>

                <TouchableOpacity
                    disabled={page === totalPages}
                    onPress={() => setPage(page + 1)}
                >
                    <Text style={styles.pageBtn}>Next ▶</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, padding: 15, backgroundColor: "#f5f5f5" },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },

    search: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    summaryCard: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        marginHorizontal: 4,
    },
    summaryLabel: {
        color: "#fff",
        fontSize: 12,
    },
    summaryValue: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 4,
    },


    downloadBtn: {
        backgroundColor: "#2196F3",
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
    },
    downloadText: {
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center",
    },

    card: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 3,
    },
    amount: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#4CAF50",
    },

    filters: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
    filterBtn: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: "#ddd",
        marginRight: 6,
        marginBottom: 6,
    },
    active: { backgroundColor: "#4CAF50" },
    filterTxt: { fontWeight: "bold" },

    pager: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    pageBtn: { fontWeight: "bold" },
});
