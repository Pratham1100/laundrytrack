import { useMemo, useState, type ComponentType, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Barcode,
  Bell,
  CalendarDays,
  ChartColumnIncreasing,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  Menu,
  Package,
  ScanLine,
  Search,
  Shirt,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  filterLaundryOrders,
  getLaundryMetrics,
  getNextLaundryStatus,
  LAUNDRY_STATUSES,
  SAMPLE_ORDERS,
  type LaundryOrder,
  type LaundryStatus,
  type LaundryStatusFilter,
} from "./laundry-data";

type SectionName = "Dashboard" | "Orders" | "Barcode Tracking" | "Customers" | "Reports";

const NAV_ITEMS: { label: SectionName; icon: ComponentType<{ className?: string }> }[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Orders", icon: ClipboardList },
  { label: "Barcode Tracking", icon: ScanLine },
  { label: "Customers", icon: UsersRound },
  { label: "Reports", icon: ChartColumnIncreasing },
];

const STATUS_STYLE: Record<LaundryStatus, string> = {
  Received: "border-status-received/20 bg-status-received/10 text-status-received",
  "In Process": "border-status-process/20 bg-status-process/10 text-status-process",
  Ready: "border-status-ready/20 bg-status-ready/10 text-status-ready",
  Delivered: "border-status-delivered/20 bg-status-delivered/10 text-status-delivered",
};

const SECTION_COPY: Record<SectionName, { title: string; subtitle: string }> = {
  Dashboard: { title: "Laundry overview", subtitle: "Keep every order moving." },
  Orders: { title: "Laundry orders", subtitle: "Search, review, and update every order." },
  "Barcode Tracking": {
    title: "Barcode tracking",
    subtitle: "Look up an order and follow its progress.",
  },
  Customers: { title: "Customers", subtitle: "A clear view of the people you serve." },
  Reports: { title: "Reports", subtitle: "A snapshot of your laundry operations." },
};

function Brand() {
  return (
    <div className="flex items-center gap-3 px-6 py-6">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Shirt className="size-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-base font-bold leading-tight">LaundryTrack</p>
        <p className="mt-1 text-[10px] font-semibold uppercase text-muted-foreground">
          Laundry management
        </p>
      </div>
    </div>
  );
}

function Navigation({
  section,
  onSelect,
}: {
  section: SectionName;
  onSelect: (name: SectionName) => void;
}) {
  return (
    <nav aria-label="Main navigation" className="space-y-1 px-3">
      <p className="px-3 pb-2 pt-3 text-[10px] font-bold uppercase text-muted-foreground">
        Workspace
      </p>
      {NAV_ITEMS.map(({ label, icon: Icon }) => {
        const active = section === label;
        return (
          <Button
            key={label}
            type="button"
            variant={active ? "secondary" : "ghost"}
            onClick={() => onSelect(label)}
            aria-current={active ? "page" : undefined}
            className={`h-10 w-full justify-start gap-3 px-3 text-sm ${active ? "font-semibold text-primary" : "font-medium text-muted-foreground"}`}
          >
            <Icon className="size-[18px]" aria-hidden="true" />
            <span>{label}</span>
            {label === "Orders" && (
              <span className="ml-auto rounded-md bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
                8
              </span>
            )}
          </Button>
        );
      })}
    </nav>
  );
}

function Sidebar({
  section,
  onSelect,
}: {
  section: SectionName;
  onSelect: (name: SectionName) => void;
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <Brand />
      <Navigation section={section} onSelect={onSelect} />
      <div className="mt-auto p-4">
        <div className="flex items-center gap-3 border-t border-sidebar-border px-2 pt-5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <CheckCircle2 className="size-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold">Sample workspace</p>
            <p className="mt-0.5 text-xs text-muted-foreground">LaundryTrack demo</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MobileHeader({
  section,
  onSelect,
}: {
  section: SectionName;
  onSelect: (name: SectionName) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open navigation">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[18rem] border-sidebar-border bg-sidebar p-0">
          <SheetTitle className="sr-only">LaundryTrack navigation</SheetTitle>
          <Brand />
          <Navigation
            section={section}
            onSelect={(name) => {
              onSelect(name);
              setOpen(false);
            }}
          />
        </SheetContent>
      </Sheet>
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Shirt className="size-4" aria-hidden="true" />
        </div>
        <span className="text-sm font-bold">LaundryTrack</span>
      </div>
      <span className="w-9" aria-hidden="true" />
    </div>
  );
}

function PageHeader({ section }: { section: SectionName }) {
  const copy = SECTION_COPY[section];

  return (
    <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span>LaundryTrack</span>
          <span aria-hidden="true">/</span>
          <span className="text-foreground">{section}</span>
        </div>
        <h1 className="text-[26px] font-bold leading-tight tracking-normal text-foreground sm:text-[30px]">
          {copy.title}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{copy.subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground sm:flex">
          <CalendarDays className="size-4" aria-hidden="true" />
          Friday, November 20, 2026
        </div>
        <Button variant="outline" size="icon" aria-label="Notifications" className="bg-card">
          <Bell className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}

function StatusBadge({ status }: { status: LaundryStatus }) {
  return (
    <Badge variant="outline" className={`gap-1.5 whitespace-nowrap px-2.5 py-1 font-medium ${STATUS_STYLE[status]}`}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </Badge>
  );
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  description: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${color}`}>
          <Icon className="size-[18px]" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-3 text-[28px] font-bold leading-none tabular-nums text-foreground">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{description}</p>
    </section>
  );
}

function Metrics({ orders }: { orders: LaundryOrder[] }) {
  const metrics = getLaundryMetrics(orders);
  const cards = [
    {
      label: "Total orders",
      value: metrics.total,
      description: "Orders in the system",
      icon: Package,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Received",
      value: metrics.received,
      description: "Awaiting processing",
      icon: Barcode,
      color: "bg-status-received/10 text-status-received",
    },
    {
      label: "In process",
      value: metrics.inProcess,
      description: "Currently being cleaned",
      icon: Clock3,
      color: "bg-status-process/10 text-status-process",
    },
    {
      label: "Ready",
      value: metrics.ready,
      description: "Ready for pickup",
      icon: CheckCircle2,
      color: "bg-status-ready/10 text-status-ready",
    },
    {
      label: "Delivered",
      value: metrics.delivered,
      description: "Completed orders",
      icon: Shirt,
      color: "bg-status-delivered/10 text-status-delivered",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5 xl:gap-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}

function OrderFilters({
  query,
  onQueryChange,
  status,
  onStatusChange,
  count,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  status: LaundryStatusFilter;
  onStatusChange: (status: LaundryStatusFilter) => void;
  count: number;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="relative min-w-0 flex-1 sm:max-w-[280px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search customer or barcode"
          aria-label="Search customers or barcode IDs"
          className="h-10 bg-background pl-9 text-sm"
        />
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <span className="text-xs text-muted-foreground">{count} orders</span>
        <Select value={status} onValueChange={(value) => onStatusChange(value as LaundryStatusFilter)}>
          <SelectTrigger aria-label="Filter by status" className="h-10 w-[150px] bg-background text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All statuses">All statuses</SelectItem>
            {LAUNDRY_STATUSES.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function OrderTable({
  orders,
  onAdvance,
  emptyMessage = "No orders match your search.",
}: {
  orders: LaundryOrder[];
  onAdvance: (barcodeId: string) => void;
  emptyMessage?: string;
}) {
  if (orders.length === 0) {
    return (
      <div className="px-5 py-14 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Search className="size-5" aria-hidden="true" />
        </div>
        <p className="mt-3 text-sm font-semibold">No orders found</p>
        <p className="mt-1 text-xs text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[690px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase text-muted-foreground">
            <th className="px-5 py-3.5">Barcode ID</th>
            <th className="px-4 py-3.5">Customer name</th>
            <th className="px-4 py-3.5">Items</th>
            <th className="px-4 py-3.5">Date</th>
            <th className="px-4 py-3.5">Laundry status</th>
            <th className="px-4 py-3.5"><span className="sr-only">Update status</span></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const nextStatus = getNextLaundryStatus(order.status);
            return (
              <tr key={order.barcodeId} className="border-b border-border/70 last:border-0 hover:bg-muted/30">
                <td className="whitespace-nowrap px-5 py-4 font-mono text-[12px] font-semibold text-primary">
                  {order.barcodeId}
                </td>
                <td className="whitespace-nowrap px-4 py-4 font-medium">{order.customerName}</td>
                <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                  {order.items} {order.items === 1 ? "item" : "items"}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">{order.date}</td>
                <td className="px-4 py-4"><StatusBadge status={order.status} /></td>
                <td className="px-4 py-4">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={!nextStatus}
                    aria-label={nextStatus ? `Advance ${order.barcodeId} to ${nextStatus}` : `${order.barcodeId} is delivered`}
                    title={nextStatus ? `Move to ${nextStatus}` : "Order delivered"}
                    onClick={() => onAdvance(order.barcodeId)}
                    className="size-8 text-muted-foreground"
                  >
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function OrderPanel({
  orders,
  onAdvance,
  query,
  onQueryChange,
  status,
  onStatusChange,
  onViewAll,
  compact = false,
}: {
  orders: LaundryOrder[];
  onAdvance: (barcodeId: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
  status: LaundryStatusFilter;
  onStatusChange: (status: LaundryStatusFilter) => void;
  onViewAll?: () => void;
  compact?: boolean;
}) {
  const shownOrders = compact ? orders.slice(0, 5) : orders;

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 px-5 pb-1 pt-5">
        <div>
          <h2 className="text-base font-semibold">{compact ? "Recent orders" : "All orders"}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {compact ? "The latest laundry activity" : "Manage status and review order details"}
          </p>
        </div>
        {compact && onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll} className="shrink-0 gap-1 px-2 text-primary">
            View all <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Button>
        )}
      </div>
      <OrderFilters
        query={query}
        onQueryChange={onQueryChange}
        status={status}
        onStatusChange={onStatusChange}
        count={orders.length}
      />
      <OrderTable orders={shownOrders} onAdvance={onAdvance} />
    </section>
  );
}

function OrderProgress({ status }: { status: LaundryStatus }) {
  const currentIndex = LAUNDRY_STATUSES.indexOf(status);

  return (
    <div className="grid grid-cols-4 gap-1.5" aria-label={`Order status: ${status}`}>
      {LAUNDRY_STATUSES.map((step, index) => {
        const complete = index <= currentIndex;
        return (
          <div key={step} className="min-w-0 text-center">
            <div
              className={`mx-auto flex size-7 items-center justify-center rounded-full text-[11px] font-semibold ${complete ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {index < currentIndex ? <Check className="size-3.5" aria-hidden="true" /> : index + 1}
            </div>
            <p className={`mt-2 text-[10px] leading-tight ${complete ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
              {step}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function BarcodeLookup({ orders }: { orders: LaundryOrder[] }) {
  const [barcode, setBarcode] = useState("");
  const [submittedBarcode, setSubmittedBarcode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const order = submitted
    ? orders.find((item) => item.barcodeId.toLowerCase() === submittedBarcode.trim().toLowerCase())
    : undefined;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedBarcode(barcode);
    setSubmitted(true);
  };

  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Barcode className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold">Barcode lookup</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Find an order by its barcode ID.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="mt-5 flex gap-2">
        <Input
          value={barcode}
          onChange={(event) => setBarcode(event.target.value)}
          placeholder="Enter barcode ID"
          aria-label="Enter barcode ID"
          className="h-10 min-w-0 bg-background text-sm"
        />
        <Button type="submit" aria-label="Look up barcode" className="h-10 shrink-0 px-3">
          <Search className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Search</span>
        </Button>
      </form>

      {!submitted && (
        <p className="mt-4 text-xs text-muted-foreground">
          Try a sample ID: <span className="font-mono font-semibold text-primary">LT-28491</span>
        </p>
      )}
      {submitted && !order && (
        <div role="status" className="mt-4 rounded-md border border-border bg-muted/50 px-3 py-3 text-sm text-muted-foreground">
          No order found for <span className="font-mono font-semibold text-foreground">{submittedBarcode || "that barcode"}</span>.
        </div>
      )}
      {order && (
        <div className="mt-5 border-t border-border pt-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs font-semibold text-primary">{order.barcodeId}</p>
              <h3 className="mt-1 text-lg font-semibold">{order.customerName}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {order.items} {order.items === 1 ? "item" : "items"} · {order.date}
              </p>
            </div>
            <StatusBadge status={order.status} />
          </div>
          <div className="mt-6">
            <p className="mb-4 text-xs font-semibold text-muted-foreground">ORDER PROGRESS</p>
            <OrderProgress status={order.status} />
          </div>
        </div>
      )}
    </section>
  );
}

function DashboardView({
  orders,
  onAdvance,
  query,
  onQueryChange,
  status,
  onStatusChange,
  onViewAll,
}: {
  orders: LaundryOrder[];
  onAdvance: (barcodeId: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
  status: LaundryStatusFilter;
  onStatusChange: (status: LaundryStatusFilter) => void;
  onViewAll: () => void;
}) {
  return (
    <>
      <Metrics orders={orders} />
      <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1.65fr)_minmax(310px,0.85fr)]">
        <OrderPanel
          compact
          orders={orders}
          onAdvance={onAdvance}
          query={query}
          onQueryChange={onQueryChange}
          status={status}
          onStatusChange={onStatusChange}
          onViewAll={onViewAll}
        />
        <BarcodeLookup orders={orders} />
      </div>
    </>
  );
}

function CustomersView({ orders }: { orders: LaundryOrder[] }) {
  const customers = useMemo(() => {
    const grouped = new Map<string, LaundryOrder[]>();
    orders.forEach((order) => {
      const customerOrders = grouped.get(order.customerName) ?? [];
      customerOrders.push(order);
      grouped.set(order.customerName, customerOrders);
    });
    return Array.from(grouped.entries()).map(([name, customerOrders]) => ({
      name,
      orders: customerOrders.length,
      latest: customerOrders[0],
    }));
  }, [orders]);

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-5">
        <h2 className="text-base font-semibold">Customer directory</h2>
        <p className="mt-1 text-xs text-muted-foreground">Customers in your sample order history</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead><tr className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase text-muted-foreground">
            <th className="px-5 py-3.5">Customer name</th><th className="px-4 py-3.5">Orders</th><th className="px-4 py-3.5">Latest order</th><th className="px-4 py-3.5">Latest status</th>
          </tr></thead>
          <tbody>
            {customers.map((customer) => customer.latest && (
              <tr key={customer.name} className="border-b border-border/70 last:border-0">
                <td className="px-5 py-4 font-medium">{customer.name}</td>
                <td className="px-4 py-4 text-muted-foreground">{customer.orders}</td>
                <td className="px-4 py-4 font-mono text-xs text-primary">{customer.latest.barcodeId}</td>
                <td className="px-4 py-4"><StatusBadge status={customer.latest.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ReportsView({ orders }: { orders: LaundryOrder[] }) {
  const metrics = getLaundryMetrics(orders);
  const statusCounts: { status: LaundryStatus; count: number }[] = [
    { status: "Received", count: metrics.received },
    { status: "In Process", count: metrics.inProcess },
    { status: "Ready", count: metrics.ready },
    { status: "Delivered", count: metrics.delivered },
  ];
  const totalItems = orders.reduce((sum, order) => sum + order.items, 0);

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-6">
          <h2 className="text-base font-semibold">Orders by status</h2>
          <p className="mt-1 text-xs text-muted-foreground">Current distribution across all orders</p>
        </div>
        <div className="space-y-5">
          {statusCounts.map(({ status, count }) => (
            <div key={status}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2"><StatusBadge status={status} /></div>
                <span className="font-semibold tabular-nums">{count}</span>
              </div>
              <progress
                className="status-progress h-2 w-full overflow-hidden rounded-full bg-muted"
                data-status={status}
                max={Math.max(metrics.total, 1)}
                value={count}
                aria-label={`${status}: ${count} orders`}
              />
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold">At a glance</h2>
        <p className="mt-1 text-xs text-muted-foreground">A quick operational summary</p>
        <div className="mt-5 divide-y divide-border">
          <div className="flex items-center justify-between py-4">
            <span className="text-sm text-muted-foreground">Total orders</span>
            <span className="text-lg font-bold tabular-nums">{metrics.total}</span>
          </div>
          <div className="flex items-center justify-between py-4">
            <span className="text-sm text-muted-foreground">Items in care</span>
            <span className="text-lg font-bold tabular-nums">{totalItems}</span>
          </div>
          <div className="flex items-center justify-between py-4">
            <span className="text-sm text-muted-foreground">Ready for pickup</span>
            <span className="text-lg font-bold tabular-nums">{metrics.ready}</span>
          </div>
          <div className="flex items-center justify-between py-4">
            <span className="text-sm text-muted-foreground">Completed deliveries</span>
            <span className="text-lg font-bold tabular-nums">{metrics.delivered}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export function LaundryDashboard() {
  const [section, setSection] = useState<SectionName>("Dashboard");
  const [orders, setOrders] = useState(SAMPLE_ORDERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LaundryStatusFilter>("All statuses");
  const filteredOrders = useMemo(
    () => filterLaundryOrders(orders, searchQuery, statusFilter),
    [orders, searchQuery, statusFilter],
  );

  const advanceOrder = (barcodeId: string) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) => {
        if (order.barcodeId !== barcodeId) return order;
        const nextStatus = getNextLaundryStatus(order.status);
        return nextStatus ? { ...order, status: nextStatus } : order;
      }),
    );
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar section={section} onSelect={setSection} />
      <div className="min-w-0 flex-1">
        <MobileHeader section={section} onSelect={setSection} />
        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-9">
          <PageHeader section={section} />
          {section === "Dashboard" && (
            <DashboardView
              orders={orders}
              onAdvance={advanceOrder}
              query={searchQuery}
              onQueryChange={setSearchQuery}
              status={statusFilter}
              onStatusChange={setStatusFilter}
              onViewAll={() => setSection("Orders")}
            />
          )}
          {section === "Orders" && (
            <OrderPanel
              orders={filteredOrders}
              onAdvance={advanceOrder}
              query={searchQuery}
              onQueryChange={setSearchQuery}
              status={statusFilter}
              onStatusChange={setStatusFilter}
            />
          )}
          {section === "Barcode Tracking" && (
            <div className="mx-auto max-w-2xl">
              <BarcodeLookup orders={orders} />
              <div className="mt-5 flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
                <ScanLine className="size-4 shrink-0 text-primary" aria-hidden="true" />
                Enter a barcode ID to see its customer, items, and current order progress.
              </div>
            </div>
          )}
          {section === "Customers" && <CustomersView orders={orders} />}
          {section === "Reports" && <ReportsView orders={orders} />}
          {section === "Dashboard" && (
            <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
              <span>Showing {orders.length} sample orders</span>
              <span className="hidden items-center gap-1 sm:flex"><CheckCircle2 className="size-3.5" aria-hidden="true" /> Sample data</span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}