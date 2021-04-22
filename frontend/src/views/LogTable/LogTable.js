import React, { useEffect, useState } from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import CustomInput from "components/CustomInput/CustomInput.js";
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import Button from "components/CustomButtons/Button.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";
import axios from "axios";
// import Table from "components/Table/Table.js";
import { Input, Icon } from "@material-ui/core";
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import LogEntry from './LogEntry'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';

let endpoint = "http://localhost:8080";
const kafka = require('kafka-node');
// const client = new kafka.KafkaClient({ kafkaHost: "localhost:9092" });

const styles = {
    cardCategoryWhite: {
        "&,& a,& a:hover,& a:focus": {
            color: "rgba(255,255,255,.62)",
            margin: "0",
            fontSize: "14px",
            marginTop: "0",
            marginBottom: "0"
        },
        "& a,& a:hover,& a:focus": {
            color: "#FFFFFF"
        }
    },
    cardTitleWhite: {
        color: "#FFFFFF",
        marginTop: "0px",
        minHeight: "auto",
        fontWeight: "300",
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: "3px",
        textDecoration: "none",
        "& small": {
            color: "#777",
            fontSize: "65%",
            fontWeight: "400",
            lineHeight: "1"
        }
    }
};

const useStyles = makeStyles(styles);

const Logtable = () => {
    const [message, setMessage] = useState("");
    const [logs, setLogs] = useState([]);
    const [filterKey, setFilterKey] = useState(["all"]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const classes = useStyles();

    useEffect(() => {
        getTask();
    }, []);

    const onFilterKeyChange = (event, values) => {
        setFilterKey(values)
    };

    const onSubmit = () => {
        const timestamp = new Date().getTime();
        const task = {
            message: message,
            timestamp: timestamp,
            logtype: "info",
            filename: "main.go",
            host: "aws",
            service: "docker",
            tags: ["tag1", "tag2"],
        }

        // if (task) {
        console.log(task)
        axios
            .post(
                endpoint + "/api/task",
                {
                    ...task
                },
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            )
            .then((res) => {
                getTask();
                setMessage("")
                console.log(res);
            });
        // }
    };


    const onFilter = () => {
        var params = {};
        if (!filterKey.includes("all")) {
            filterKey.map((keyvalue) => {
                const pair = keyvalue.split(":")
                params[pair[0]] = pair[1];
                return pair;
            })
        }
        console.log(params)
        axios
            .get(
                endpoint + "/api/filter-task",
                {
                    params
                }
            )
            .then((res) => {
                if (res.data) {
                    setLogs(res.data)
                } else {
                    setLogs([])
                }
            });
    }

    const getTask = () => {
        const Consumer = kafka.Consumer;
        const client = new kafka.KafkaClient({ idleConnection: 24 * 60 * 60 * 1000, kafkaHost: "https://localhost", kafkaPort: "9092"});

        let consumer = new Consumer(
            client,
            [{ topic: "Eventarc", partition: 0, offset: 0 }],
            {
                // autoCommit: true,
                fetchMaxWaitMs: 1000,
                fetchMaxBytes: 1024 * 1024,
                encoding: 'utf8',
                // fromOffset: false
            }
        );
        consumer.on('message', async function (message) {
            const new_logs = logs + [JSON.parse(message.value)]
            setLogs(new_logs)
            console.log(
                'kafka ',
                JSON.parse(message.value)
            );
        })
        consumer.on('error', function (error) {
            //  handle error 
            console.log('error', error);
        });
        axios.get(endpoint + "/api/task").then((res) => {
            if (res.data) {
                setLogs(res.data)
            } else {
                setLogs([])
            }
        });
    };
    const columns = ['timestamp', 'filename', 'message'];

    return (
        <div>
            <div className="row">
                <h3>Logs</h3>
            </div>
            <GridContainer>
                <GridItem xs={12} sm={12} md={4}>
                    <Input
                        type="text"
                        name="task"
                        id="message"
                        onChange={(event) => { setMessage(event.target.value) }}
                        value={message}
                        fluid
                        placeholder="Create Log"
                    />
                    <Button id="message" color="primary" onClick={() => { onSubmit() }}>Create Log</Button>
                </GridItem>
                <GridItem xs={12} sm={12} md={6}>
                    {/* Filter By Key */}
                    <Autocomplete
                        multiple
                        id="log-filter"
                        options={["all", "filename:main.go", "message:contain", "date", "logtype:info", "host:google", "service:gcp", "tag:asdf"]}
                        defaultValue={["all"]}
                        freeSolo
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField {...params} variant="filled" label="Log Filters" placeholder="Favorites" />
                        )}
                        onChange={(event, value) => { onFilterKeyChange(event, value) }}
                    />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                    <Button id="log-filter" color="primary" onClick={() => { onFilter() }}>Filter Logs</Button>
                </GridItem>
            </GridContainer>
            <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                    <Card>
                        <CardHeader plain color="primary">
                            <h4 className={classes.cardTitleWhite}>
                                Logs
                            </h4>
                            <p className={classes.cardCategoryWhite}>
                                subtitle
                            </p>
                        </CardHeader>
                        <CardBody>
                            {/* <Table
                                tableHeaderColor="primary"
                                tableHead={["Date", "Filename", "Message"]}
                                tableData={
                                    logs.map((item) => {
                                        return (
                                            [item.timestamp, item.filename, item.message]
                                        );

                                    })

                                }
                            /> */}
                            <TableContainer>
                                <Table stickyHeader aria-label="sticky table">
                                    <TableHead>
                                        <TableRow>
                                            {columns.map((column) => (
                                                <TableCell
                                                    key={column}
                                                >
                                                    {column}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {logs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                                            return (
                                                <LogEntry columns={columns} item={row}></LogEntry>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 100]}
                                component="div"
                                count={logs.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onChangePage={handleChangePage}
                                onChangeRowsPerPage={handleChangeRowsPerPage}
                            />
                        </CardBody>
                    </Card>
                </GridItem>

            </GridContainer>
        </div>
    );
}

export default Logtable;