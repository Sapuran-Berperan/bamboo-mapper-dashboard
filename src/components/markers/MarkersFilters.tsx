import { useEffect, useId, useState } from "react";
import { format, parse } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { CalendarIcon, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import type { MarkersSearch } from "@/routes/markers";

interface MarkersFiltersProps {
	search: string | undefined;
	sortBy: MarkersSearch["sort_by"];
	sortDir: MarkersSearch["sort_dir"];
	dateFrom: string | undefined;
	dateTo: string | undefined;
	creatorId: string | undefined;
	onFilterChange: (updates: Partial<MarkersSearch>) => void;
}

const SORT_OPTIONS = [
	{ value: "created_at-desc", label: "Terbaru" },
	{ value: "created_at-asc", label: "Terlama" },
	{ value: "name-asc", label: "Nama (A-Z)" },
	{ value: "name-desc", label: "Nama (Z-A)" },
	{ value: "strain-asc", label: "Jenis Bambu (A-Z)" },
	{ value: "strain-desc", label: "Jenis Bambu (Z-A)" },
	{ value: "quantity-desc", label: "Jumlah (Terbanyak)" },
	{ value: "quantity-asc", label: "Jumlah (Tersedikit)" },
	{ value: "updated_at-desc", label: "Terakhir Diperbarui" },
] as const;

function parseDate(dateString: string | undefined): Date | undefined {
	if (!dateString) return undefined;
	return parse(dateString, "yyyy-MM-dd", new Date());
}

function formatDateString(date: Date | undefined): string | undefined {
	if (!date) return undefined;
	return format(date, "yyyy-MM-dd");
}

export function MarkersFilters({
	search,
	sortBy,
	sortDir,
	dateFrom,
	dateTo,
	creatorId,
	onFilterChange,
}: MarkersFiltersProps) {
	const id = useId();
	const searchId = `${id}-search`;
	const sortId = `${id}-sort`;
	const creatorIdInputId = `${id}-creator-id`;

	const [searchInput, setSearchInput] = useState(search ?? "");
	const debouncedSearch = useDebounce(searchInput, 300);

	// Update URL when debounced search changes
	useEffect(() => {
		if (debouncedSearch !== search) {
			onFilterChange({ search: debouncedSearch || undefined });
		}
	}, [debouncedSearch, search, onFilterChange]);

	// Sync local input when URL changes (e.g., browser back)
	useEffect(() => {
		setSearchInput(search ?? "");
	}, [search]);

	const currentSort =
		sortBy && sortDir ? `${sortBy}-${sortDir}` : "created_at-desc";

	const handleSortChange = (value: string) => {
		const [newSortBy, newSortDir] = value.split("-") as [
			MarkersSearch["sort_by"],
			MarkersSearch["sort_dir"],
		];
		onFilterChange({ sort_by: newSortBy, sort_dir: newSortDir });
	};

	const handleDateFromChange = (date: Date | undefined) => {
		onFilterChange({ date_from: formatDateString(date) });
	};

	const handleDateToChange = (date: Date | undefined) => {
		onFilterChange({ date_to: formatDateString(date) });
	};

	const handleCreatorIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.trim();
		// Only update if empty or valid UUID format
		if (!value || /^[0-9a-f-]{36}$/i.test(value)) {
			onFilterChange({ creator_id: value || undefined });
		}
	};

	const handleReset = () => {
		setSearchInput("");
		onFilterChange({
			search: undefined,
			sort_by: undefined,
			sort_dir: undefined,
			date_from: undefined,
			date_to: undefined,
			creator_id: undefined,
			page: 1,
		});
	};

	const hasActiveFilters =
		search || sortBy || sortDir || dateFrom || dateTo || creatorId;

	const dateFromValue = parseDate(dateFrom);
	const dateToValue = parseDate(dateTo);

	return (
		<div className="flex flex-wrap items-end gap-4 mb-6">
			{/* Search Input */}
			<div className="flex-1 min-w-[200px] max-w-sm">
				<Label htmlFor={searchId} className="mb-1.5 block">
					Cari
				</Label>
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						id={searchId}
						placeholder="Nama, deskripsi, atau jenis..."
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						className="pl-9"
					/>
				</div>
			</div>

			{/* Sort Dropdown */}
			<div className="w-[180px]">
				<Label htmlFor={sortId} className="mb-1.5 block">
					Urutkan
				</Label>
				<Select value={currentSort} onValueChange={handleSortChange}>
					<SelectTrigger id={sortId}>
						<SelectValue placeholder="Pilih urutan" />
					</SelectTrigger>
					<SelectContent>
						{SORT_OPTIONS.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Date From */}
			<div className="w-[160px]">
				<Label className="mb-1.5 block">Dari Tanggal</Label>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className={cn(
								"w-full justify-start text-left font-normal",
								!dateFromValue && "text-muted-foreground",
							)}
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{dateFromValue
								? format(dateFromValue, "d MMM yyyy", { locale: idLocale })
								: "Pilih tanggal"}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							mode="single"
							selected={dateFromValue}
							onSelect={handleDateFromChange}
							disabled={(date) => (dateToValue ? date > dateToValue : false)}
							initialFocus
						/>
					</PopoverContent>
				</Popover>
			</div>

			{/* Date To */}
			<div className="w-[160px]">
				<Label className="mb-1.5 block">Sampai Tanggal</Label>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className={cn(
								"w-full justify-start text-left font-normal",
								!dateToValue && "text-muted-foreground",
							)}
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{dateToValue
								? format(dateToValue, "d MMM yyyy", { locale: idLocale })
								: "Pilih tanggal"}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							mode="single"
							selected={dateToValue}
							onSelect={handleDateToChange}
							disabled={(date) =>
								dateFromValue ? date < dateFromValue : false
							}
							initialFocus
						/>
					</PopoverContent>
				</Popover>
			</div>

			{/* Creator ID */}
			<div className="w-[280px]">
				<Label htmlFor={creatorIdInputId} className="mb-1.5 block">
					Creator ID
				</Label>
				<Input
					id={creatorIdInputId}
					placeholder="UUID creator..."
					value={creatorId ?? ""}
					onChange={handleCreatorIdChange}
					className="font-mono text-sm"
				/>
			</div>

			{/* Reset Button */}
			{hasActiveFilters && (
				<Button
					variant="ghost"
					size="icon"
					onClick={handleReset}
					title="Reset filter"
				>
					<RotateCcw className="h-4 w-4" />
				</Button>
			)}
		</div>
	);
}
