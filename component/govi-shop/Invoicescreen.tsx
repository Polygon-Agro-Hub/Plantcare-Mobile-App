import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from "@react-navigation/stack";
import { WebView } from "react-native-webview";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { FontAwesome6 } from "@expo/vector-icons";
import { environment } from "@/environment/environment";
import { RootStackParamList } from "../types/types";

type InvoiceNavigationProp = StackNavigationProp<
  RootStackParamList,
  "InvoiceScreen"
>;
type InvoiceRouteProp = RouteProp<RootStackParamList, "InvoiceScreen">;

interface InvoiceScreenProps {
  navigation: InvoiceNavigationProp;
  route: InvoiceRouteProp;
}

interface InvoiceItem {
  no: number;
  productId: number;
  name: string;
  variantLabel: string;
  colorCode: string | null;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

interface InvoiceData {
  orderId: number;
  invNo: string;
  invoiceDate: string;
  shop: {
    shopName: string;
    logo: string | null;
  };
  branch: {
    branchName: string;
    district: string;
    province: string;
    phone: string;
  };
  customer: {
    name: string;
    phone: string | null;
  };
  items: InvoiceItem[];
  subtotal: number;
  serviceCharge: number;
  grandTotal: number;
}

const formatPrice = (n: number) =>
  Number(n || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/**
 * Generates invoice HTML.
 *
 * @param invoice  invoice data
 * @param forPrint when true, produces a page-filling layout suited for
 *                 expo-print (no horizontal-scroll wrapper, content
 *                 stretches to 100% of the page width). When false
 *                 (default), produces the horizontally-scrollable layout
 *                 used for the in-app WebView preview.
 */
const generateInvoiceHtml = (
  invoice: InvoiceData,
  forPrint: boolean = false,
) => {
  const dateStr = invoice.invoiceDate
    ? new Date(invoice.invoiceDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

  const itemRows = invoice.items
    .map((item) => {
      const subLine =
        item.variantLabel || item.colorCode
          ? `<div class="item-sub">${item.variantLabel ?? ""}${
              item.colorCode
                ? ` <span class="swatch" style="background:${item.colorCode}"></span>`
                : ""
            }</div>`
          : "";

      return `
      <tr>
        <td class="cell num">${item.no}</td>
        <td class="cell item-col">
          <div class="item-name">${item.name}</div>
          ${subLine}
        </td>
        <td class="cell center">${item.qty}</td>
        <td class="cell">Rs. ${formatPrice(item.unitPrice)}</td>
        <td class="cell right">Rs. ${formatPrice(item.lineTotal)}</td>
      </tr>`;
    })
    .join("");

  const layoutCss = forPrint
    ? `
        @page {
          size: A4;
          margin: 18mm 14mm;
        }
        .page-scroll {
          width: 100%;
        }
        .page-content {
          width: 100%;
          padding: 0;
        }
        .invoice-title,
        .company-name,
        .company-line,
        .meta-label,
        .meta-value,
        .customer-label,
        .customer-name,
        .customer-phone,
        table.items thead th,
        .cell,
        .item-name,
        .item-sub,
        .totals td,
        .footer {
          white-space: normal;
        }
        .cell.item-col {
          min-width: 0;
        }
      `
    : `
        .page-scroll {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .page-content {
          min-width: 640px;   /* full design width — everything below stays intact */
          width: max-content;
          padding: 28px 24px;
        }
      `;

  return `
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        * { box-sizing: border-box; }
        html, body {
          margin: 0;
          padding: 0;
          background: #fff;
          width: 100%;
        }
        body {
          font-family: -apple-system, Helvetica, Arial, sans-serif;
          color: #1a1a1a;
        }

        ${layoutCss}

        .top-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
        }
        .invoice-title {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 18px 0;
          white-space: nowrap;
        }
        .meta-table td {
          font-size: 12px;
          padding: 1px 0;
          vertical-align: top;
          white-space: nowrap;
        }
        .meta-label {
          color: #8a8a8a;
          padding-right: 14px;
          white-space: nowrap;
        }
        .meta-value {
          color: #1a1a1a;
          font-weight: 500;
          white-space: nowrap;
        }
        .company-block {
          text-align: right;
          flex-shrink: 0;
        }
        .company-name {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 4px 0;
          white-space: nowrap;   /* keep company name on a single line */
        }
        .company-line {
          font-size: 12px;
          color: #8a8a8a;
          line-height: 1.5;
          white-space: nowrap;   /* keep each address line on a single line */
        }
        .customer-block {
          margin-top: 22px;
        }
        .customer-label {
          font-size: 12px;
          color: #8a8a8a;
          font-weight: 600;
          margin-bottom: 4px;
          white-space: nowrap;
        }
        .customer-name {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
          white-space: nowrap;
        }
        .customer-phone {
          font-size: 12px;
          color: #555;
          margin-top: 2px;
          white-space: nowrap;
        }

        table.items {
          width: 100%;
          margin-top: 22px;
          border-collapse: collapse;
        }
        table.items thead th {
          font-size: 11px;
          color: #8a8a8a;
          font-weight: 600;
          text-align: left;
          padding-bottom: 10px;
          border-bottom: 1px solid #e5e5e5;
          white-space: nowrap;
        }
        table.items thead th.center { text-align: center; }
        table.items thead th.right { text-align: right; }
        .cell {
          font-size: 12.5px;
          padding: 10px 8px;
          border-bottom: 1px solid #f0f0f0;
          vertical-align: top;
          white-space: nowrap;
        }
        .cell.item-col {
          white-space: nowrap;
          min-width: 180px;
        }
        .cell.num { color: #8a8a8a; width: 24px; }
        .cell.center { text-align: center; }
        .cell.right { text-align: right; font-weight: 600; }
        .item-name { font-weight: 500; color: #1a1a1a; white-space: nowrap; }
        .item-sub {
          font-size: 11px;
          color: #8a8a8a;
          margin-top: 2px;
          display: flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
        }
        .swatch {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 2px;
          border: 1px solid #ddd;
          flex-shrink: 0;
        }
        .totals {
          margin-top: 18px;
          margin-left: auto;
          width: 260px;
        }
        .totals td {
          font-size: 12.5px;
          padding: 5px 0;
          white-space: nowrap;
        }
        .totals .t-label { color: #8a8a8a; }
        .totals .t-value { text-align: right; font-weight: 500; }
        .totals .grand td {
          border-top: 1px solid #1a1a1a;
          padding-top: 10px;
          font-size: 15px;
          font-weight: 700;
        }
        .footer {
          margin-top: 36px;
          font-size: 12px;
          color: #8a8a8a;
          border-top: 1px solid #f0f0f0;
          padding-top: 14px;
          white-space: nowrap;
        }
      </style>
    </head>
    <body>
      <div class="page-scroll">
        <div class="page-content">
          <div class="top-row">
            <div>
              <p class="invoice-title">Invoice</p>
              <table class="meta-table">
                <tr>
                  <td class="meta-label">Order No.</td>
                  <td class="meta-value">${invoice.invNo ?? ""}</td>
                </tr>
                <tr>
                  <td class="meta-label">Invoice Date</td>
                  <td class="meta-value">${dateStr}</td>
                </tr>
              </table>
              <div class="customer-block">
                <div class="customer-label">Customer Details</div>
                <div class="customer-name">${invoice.customer?.name ?? ""}</div>
                <div class="customer-phone">${invoice.customer?.phone ?? ""}</div>
              </div>
            </div>

            <div class="company-block">
              <p class="company-name">${invoice.shop?.shopName ?? ""}</p>
              <div class="company-line">${invoice.branch?.branchName ?? ""}</div>
              <div class="company-line">${invoice.branch?.district ?? ""}, ${invoice.branch?.province ?? ""}</div>
              <div class="company-line">${invoice.branch?.phone ?? ""}</div>
            </div>
          </div>

          <table class="items">
            <thead>
              <tr>
                <th>#</th>
                <th>Item Name</th>
                <th class="center">Qty</th>
                <th>Unit Price</th>
                <th class="right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <table class="totals">
            <tr>
              <td class="t-label">Subtotal</td>
              <td class="t-value">Rs. ${formatPrice(invoice.subtotal)}</td>
            </tr>
            <tr>
              <td class="t-label">Service Charge</td>
              <td class="t-value">+ Rs. ${formatPrice(invoice.serviceCharge)}</td>
            </tr>
            <tr class="grand">
              <td class="t-label">Grand Total</td>
              <td class="t-value">Rs. ${formatPrice(invoice.grandTotal)}</td>
            </tr>
          </table>

          <div class="footer">
            Thank you for doing business with us. Have a good day!
          </div>
        </div>
      </div>
    </body>
  </html>`;
};

const InvoiceScreen: React.FC<InvoiceScreenProps> = ({ navigation, route }) => {
  const { orderId } = route.params;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("Not authenticated");
      console.log("order id", orderId);

      const { data } = await axios.get(
        `${environment.API_BASE_URL}api/govi-shop/orders/${orderId}/invoice`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setInvoice(data);
    } catch (err: any) {
      console.error("Fetch invoice error:", err?.response?.data ?? err.message);
      setError("Couldn't load your invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const handleDownload = async () => {
    if (!invoice || downloading) return;
    try {
      setDownloading(true);

      const html = generateInvoiceHtml(invoice, true);
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
        width: 595,
        height: 842,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `Invoice ${invoice.invNo}`,
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("Saved", `Invoice saved to ${uri}`);
      }
    } catch (err) {
      console.error("Download invoice error:", err);
      Alert.alert("Error", "Couldn't generate the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleClose = () => navigation.replace("ExploreShopsScreen");

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4 bg-[#000000]">
        <TouchableOpacity
          onPress={handleClose}
          className="w-8 h-8 rounded-full bg-gray-700 items-center justify-center"
        >
          <Text className="text-white text-sm font-bold">✕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDownload}
          disabled={!invoice || downloading}
          className="w-8 h-8 items-center justify-center"
        >
          {downloading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <FontAwesome6 name="download" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Body */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF8000" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-gray-600 text-center mb-4">{error}</Text>
          <TouchableOpacity
            onPress={fetchInvoice}
            className="bg-gray-900 rounded-full px-6 h-[44px] items-center justify-center"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : invoice ? (
        <WebView
          originWhitelist={["*"]}
          source={{ html: generateInvoiceHtml(invoice, false) }}
          style={{ flex: 1, backgroundColor: "#fff" }}
          scalesPageToFit={false}
        />
      ) : null}
    </View>
  );
};

export default InvoiceScreen;
