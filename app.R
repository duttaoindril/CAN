# cls && R -q
# shiny::runApp('C:/Users/dutta/Dropbox/Apps/Github/CAN', port=1234)
library(shiny)
library(shinydashboard)
library(jsonlite)

shinyApp(ui = dashboardPage(
    dashboardHeader(disable = TRUE), #Hide Header
    dashboardSidebar(disable = TRUE), #Hide Sidebar
    #Hide tab selector, CSS code to work
    dashboardBody(tags$head(tags$style(HTML('
            #tabz {
                display: none;
            }
            #bvts {
                height: 800px;
            }
        ')),
        # Javascript Code to Run
        tags$script(HTML("
            function heightFix() {
                console.log('JS Works');
            }
            window.onload = function() { heightFix(); };
        "))),
         # Beginning of actual UI, everything is in a tab layout, each tab has a box with the plot output.
        fluidRow(
            tabsetPanel(id = "tabz",
                tabPanel("0",
                    box(width = 12,
                         h1("Map")
                    )
                ),
                tabPanel("1",
                    box(width = 12,
                        plotOutput("bvts") # Battery Voltage Status
                    )
                ),
                tabPanel("2",
                    box(width = 12,
                        plotOutput("ests") # Engine Status
                    )
                ),
                tabPanel("3",
                    box(width = 12,
                        plotOutput("ignsts") # Ignition Switch Status
                    )
                ),
                tabPanel("4",
                    box(width = 12,
                        plotOutput("afcrts") # Average Fuel Consumption Rate Status
                    )
                ),
                tabPanel("5",
                    box(width = 12,
                        plotOutput("ifcrts") # Instant Fuel Consumption Rate Status
                    )
                ),
                tabPanel("6",
                    box(width = 12,
                        plotOutput("dtets") # Distance to Empty Status
                    )
                ),
                tabPanel("7",
                    box(width = 12,
                        plotOutput("tpsts") # Throttle Valve Opening Status
                    )
                ),
                tabPanel("8",
                    box(width = 12,
                        plotOutput("vhsts") # Vehicle Speed Status
                    )
                ),
                tabPanel("9",
                    box(width = 12,
                        plotOutput("slpts") # Shift Lever Position Status
                    )
                ),
                tabPanel("10",
                    box(width = 12,
                        plotOutput("tptsFR"), # Front Right Tire Pressure Status
                        plotOutput("tptsFL"), # Front Left Tire Pressure Status
                        plotOutput("tptsRR"), # Rear Right Tire Pressure Status
                        plotOutput("tptsRL") # Rear Left Tire Pressure Status
                    )
                )
            )
        )
    )
), server = shinyServer(function(input, output, session) { # Server code to fill up UI
    print("==============================================================================================================================")
    updateTabsetPanel(session, "tabz", selected = isolate(parseQueryString(session$clientData$url_search))[["tab"]]) # Set tab to passed in tab
    theData <- reactive({ # The selected data that will be displayed in outputs
        query <- parseQueryString(session$clientData$url_search)
        fromJSON("allData.json", simplifyVector = T, simplifyDataFrame = T, simplifyMatrix = T, flatten = T)[[query[["cId"]]]][[query[["vId"]]]]
    })
    log <- reactive({
        theData()$location
    })
    getTSPlot <- function(id, col, title, subtitle, xaxislabel, yaxislabel, timeFormat, alt, ticks) {
        if(NROW(theData()[[id]][[col]]) > 0) {
            timestamps = as.POSIXct(theData()[[id]]$time, tz = "", origin="1970-01-01")
            yaxis = "s"
            if(alt)
                yaxis = "n"
            plot(timestamps, theData()[[id]][[col]] , xaxt="n", yaxt=yaxis, main = title, sub = "", xlab = "", ylab = yaxislabel, type="b")
            axis.POSIXct(1, at = timestamps, labels = format(timestamps, timeFormat), las = 2)
            if(alt)
                axis(2,-2:6, labels = ticks, las = 3)
            # mtext(side = 1, text = xaxislabel, line = 4.25)
        }
    }
    output$bvts = renderPlot({
        getTSPlot("424", "BATT_VOLT", "Battery Voltage over Time", "", "Time in Month Day & Year", paste("Battery Voltage in", theData()[["424"]]$BATT_VOLTUnit[1]), "%b %d %y", FALSE)
    })
    output$ests = renderPlot({
        getTSPlot("101", "ENGINE_STATUS", "Engine Status over Time", "-1 is Signal not available, 0 is Engine stall, 1 is Engine cranking, 2 is Engine Running", "Time in Month Day & Year", "Engine Status", "%b %d %y", TRUE, c("", "SNA", "Stalled", "Cranking", "Running", "", "", "", ""))
    })
    output$ignsts = renderPlot({
        getTSPlot("424", "IGN_STAT", "Ignition Status over Time", "-1 is Signal not available, 0 is Ignition off & acc, 1 is Ignition Off; Not Used, 2 is Ignition Accessory Not Used, 3 is Ignition Locked, 4 is Ignition Started, 5 is Ignition running", "Time in Month Day & Year", "Ignition Status", "%b %d %y", TRUE, c("", "SNA", "Off & Acc", "Off", "Acc", "Locked", "Started", "Running", ""))
    })
    output$afcrts = renderPlot({
        getTSPlot("151", "DRV_CONS_SCALE", "Average Fuel Consumption Rate over Time", "", "Time in Month Day & Year", paste("Average Fuel Consumption Rate in", theData()[["151"]]$DRV_CONS_SCALEUnit[1]))
    })
    output$ifcrts = renderPlot({
        getTSPlot("151", "INST_FCONS", "Instant Fuel Consumption Rate over Time", "", "Time in Month Day & Year", paste("Instant Fuel Consumption Rate in", theData()[["151"]]$INST_FCONSUnit[1]))
    })
    output$dtets = renderPlot({
        getTSPlot("151", "DIST2EMPTY", "Distance to Empty over Time", "", "Time in Month Day & Year", paste("Distance to Empty in in", theData()[["151"]]$DIST2EMPTYUnit[1]))
    })
    output$tpsts = renderPlot({
        getTSPlot("210", "TPS", "Throttle Valve Opening over Time", "", "Time in Month Day & Year", "Throttle Valve Opening in %")
    })
    output$vhsts = renderPlot({
        getTSPlot("215", "VEH_SPEED", "Vehicle Speed over Time", "", "Time in Month Day & Year", paste("Vehicle Speed in", theData()[["215"]]$VEH_SPEEDUnit[1]))

        if(NROW(theData()[["215"]]$VEH_SPEED) > 0) {
            timestamps = as.POSIXct(theData()[["215"]]$time, tz = "", origin="1970-01-01")
            timestamps = as.Date(strptime(timestamps, "%Y-%m-%dT%H:%M:%S"))
            plot(main = "Vehicle Speed over Time", timestamps, theData()[["215"]]$VEH_SPEED, xaxt="x", xlab = "Time in Epoch", ylab = "Vehicle Speed in <UNITS>", type="o")
        }
    })
    output$slpts = renderPlot({
        getTSPlot("39B", "SFT_POSITION_Sub", "Shift Lever Position over Time", "", "Time in Month Day & Year", paste("Shift Lever Position in", theData()[["39B"]]$SFT_POSITION_SubUnit[1]))
        if(NROW(theData()[["39B"]]$SFT_POSITION_Sub) > 0) {
            timestamps = as.POSIXct(theData()[["39B"]]$time, tz = "", origin="1970-01-01")
            timestamps = as.Date(strptime(timestamps, "%Y-%m-%dT%H:%M:%S"))
            plot(main = "Shift Lever Position over Time", timestamps, theData()[["39B"]]$SFT_POSITION_Sub, xaxt="x", xlab = "Time in Epoch", ylab = "Shift Lever Position in <UNITS>", type="o")
        }
    })
    output$tptsFR = renderPlot({
        getTSPlot("6EA", "TPM_V_FR", "Front Right Tire Pressure over Time", "", "Time in Month Day & Year", paste("Front Right Tire Pressure in", theData()[["6EA"]]$TPM_V_FRUnit[1]))
    })
    output$tptsFL = renderPlot({
        getTSPlot("6EA", "TPM_V_FL", "Front Left Tire Pressure over Time", "", "Time in Month Day & Year", paste("Front Left Tire Pressure in", theData()[["6EA"]]$TPM_V_FLUnit[1]))
    })
    output$tptsRR = renderPlot({
        getTSPlot("6EA", "TPM_V_RR", "Rear Right Tire Pressure over Time", "", "Time in Month Day & Year", paste("Rear Right Tire Pressure in", theData()[["6EA"]]$TPM_V_RRUnit[1]))
    })
    output$tptsRR = renderPlot({
        getTSPlot("6EA", "TPM_V_RL", "Rear Left Tire Pressure over Time", "", "Time in Month Day & Year", paste("Rear Left Tire Pressure in", theData()[["6EA"]]$TPM_V_RLUnit[1]))
    })
}))

# if(NROW(theData()[["424"]][["BATT_VOLT"]]) > 0) {
#     timestamps = as.POSIXct(theData()[["424"]]$time, tz = "", origin="1970-01-01")
#     #timestamps = as.Date(strptime(timestamps, "%Y-%m-%dT%H:%M:%S"))
#     plot(main = "Battery Voltage over Time", timestamps, theData()[["424"]]$BATT_VOLT, xaxt="n", xlab = "Time in Epoch", ylab = "Battery Voltage in ", type="o")
#     axis.POSIXct(1, at = timestamps, labels = format(timestamps, "%b-%d"), las = 2)
# }

# textInput("symbol", "Symbol Entry", ""),
# dateInput("date_start", value = "2005-01-01", startview = "year", h4("Start Date")),
# selectInput("period_select", label = h4("Frequency of Updates"),
#     c("Monthly" = 1, "Quarterly" = 2, "Weekly" = 3, "Daily" = 4)),
# sliderInput("smaLen", label = "SMA Len",min = 1, max = 200, value = 115),
# br(),
# checkboxInput("usema", "Use MA", FALSE)

# observe({
# 	query <- parseQueryString(session$clientData$url_search)
# 	for (i in 1:(length(reactiveValuesToList(input)))) {
# 		nameval = names(reactiveValuesToList(input)[i])
#         print(nameval)
# 		valuetoupdate = query[[nameval]]
#         print(valuetoupdate)
# 		if (!is.null(query[[nameval]])) {
# 			if (is.na(as.numeric(valuetoupdate))) {
# 				updateTextInput(session, nameval, value = valuetoupdate)
# 			} else {
# 				updateTextInput(session, nameval, value = as.numeric(valuetoupdate))
# 			}
# 		}
# 	}
# })