# cls && R -q
# shiny::runApp('C:/Users/dutta/OneDrive - sjsu.edu/Aeris/CAN', port=1234)
library(shiny)
library(shinydashboard)
library(jsonlite)

shinyApp(ui = dashboardPage(
    dashboardHeader(disable = TRUE),
    dashboardSidebar(disable = TRUE),
    dashboardBody(tags$head(tags$style(HTML('
            #tabz {
                display: none;
            }
        ')),
        # Javascript code to run
        tags$script(HTML("
            console.log('JS Works');
        "))),
        fluidRow(
            tabsetPanel(id = "tabz",
                tabPanel("map",
                    box(width = 12,
                         h1("Map")
                    )
                ),
                tabPanel("batteryVoltage",
                    box(width = 12,
                        h1("Battery Voltage over Time"),
                        plotOutput("bvts")
                    )
                )
            )
        )
    )
), server = shinyServer(function(input, output, session) {
    print("==============================================================================================================================")
    updateTabsetPanel(session, "tabz", selected = isolate(parseQueryString(session$clientData$url_search))[["tab"]])
    allData = fromJSON("allData.json", simplifyVector = T, simplifyDataFrame = T, simplifyMatrix = T, flatten = T)
    theData <- reactive({
        query <- parseQueryString(session$clientData$url_search)
        temp = allData[[query[["cId"]]]][[query[["vId"]]]]
        temp
    })
    log <- reactive({
        theData()$location
    })
    output$bvts = renderPlot({
        plot(theData()[["424"]]$time, theData()[["424"]]$BATT_VOLT, type="l")
    })
}))

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