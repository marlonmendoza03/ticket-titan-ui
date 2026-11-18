import { Link, Paper } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useMemo } from "react";
import { useGetChatSessionsQuery } from "../api/storyApi";
import dayjs from "dayjs";

const columns: GridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    flex: 1,
    minWidth: 70,
    sortable: true,
    renderCell: (params) => {
      return params.value;
    },
  },
  {
    field: "title",
    headerName: "Title",
    flex: 2,
    minWidth: 150,
    sortable: true,
  },
  {
    field: "category",
    headerName: "Category",
    flex: 0.5,
    minWidth: 100,
    sortable: true,
  },
  {
    field: "episodeCount",
    headerName: "Episodes",
    flex: 0.5,
    minWidth: 75,
    sortable: true,
  },
  {
    field: "episodeDurationInSec",
    headerName: "Duration",
    flex: 0.5,
    minWidth: 80,
    sortable: true,
  },
  {
    field: "createdAt",
    headerName: "Created On",
    flex: 2,
    minWidth: 100,
    sortable: true,
  },
  {
    field: "updatedAt",
    headerName: "Last Updated",
    flex: 2,
    minWidth: 100,
    sortable: true,
  },
  {
    field: "actions",
    headerName: "Open Session",
    flex: 1,
    minWidth: 100,
    sortable: false,
    renderCell: (params) => {
      return (
        <Link
          href={`/tickets/${params.row.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Navigate
        </Link>
      );
    },
  },
];

export const TicketTable = () => {
  const { data: sessions, isLoading } = useGetChatSessionsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const chatSessions = useMemo(() => {
    if (!sessions || isLoading) return [];
    const seenTitles = new Set<string>();
    const filteredSessions = sessions.filter((session) => {
      if (seenTitles.has(session.title)) {
        return false;
      }
      seenTitles.add(session.title);
      return true;
    });

    return filteredSessions.map((session) => {
      const [category, episodeCount, episodeDurationInSec] =
        session.title.split("|");
      return {
        id: session.id,
        title: session.title,
        category: category,
        episodeCount: episodeCount.replace("Number of Episodes:", " "),
        episodeDurationInSec: episodeDurationInSec.replace(
          "Duration per Episode:",
          " ",
        ),
        createdAt: dayjs(session.createdAt).format("ddd MMM-DD-YYYY h:mm A"),
        updatedAt: dayjs(session.updatedAt).format("ddd MM-DD-YYYY h:mm A"),
      };
    });
  }, [isLoading, sessions]);

  return (
    <Paper className="ticket-table-paper" elevation={0}>
      <div className="table-scroll">
        <DataGrid
          rows={chatSessions}
          columns={columns}
          localeText={{
            noRowsLabel: "No session available right now",
            noResultsOverlayLabel: "No matching records found",
          }}
          loading={isLoading}
        />
      </div>
    </Paper>
  );
};
